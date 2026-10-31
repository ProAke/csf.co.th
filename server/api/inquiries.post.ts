import path from 'node:path'
import { createError, getHeader, readBody, readMultipartFormData, setHeader } from 'h3'
import { dbExecute, dbQueryOne } from '../utils/db'
import { saveUploadedBuffer } from '../utils/media'
import {
  checkRateLimit,
  getClientIp,
  logSecurityEvent,
  validateFileSignature,
  verifyMathChallenge
} from '../utils/security'
import { sendLineInquiryNotification } from '../utils/social'

export interface InquiryAttachmentMeta {
  name: string
  url: string
  size: number
  ext: string
  mime_type: string
}

const ALLOWED_INQUIRY_EXTS = new Set([
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.xls',
  '.xlsx',
  '.csv',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx'
])

const MAX_FILES = 5
const MAX_FILE_BYTES = 20 * 1024 * 1024 // 20 MB per file

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const ip = getClientIp(event)

  // 1. Rate Limit Public Inquiry Endpoint (8 requests per 10 minutes per IP)
  const rl = checkRateLimit('public_inquiry', ip, 8, 10 * 60 * 1000)
  if (!rl.allowed) {
    setHeader(event, 'Retry-After', String(rl.retryAfterSec))
    await logSecurityEvent({
      event,
      eventType: 'rate_limit_blocked',
      severity: 'warn',
      detail: `บล็อกการส่งฟอร์มติดต่อซ้ำถี่เกินกำหนดจาก IP ${ip}`
    })
    throw createError({
      statusCode: 429,
      statusMessage: 'ส่งข้อมูลความถี่สูงเกินกำหนด กรุณารอสักครู่แล้วลองใหม่อีกครั้ง'
    })
  }

  const contentType = getHeader(event, 'content-type') || ''
  const fields: Record<string, string> = {}
  const pendingFiles: Array<{ filename: string; data: Buffer; mime: string }> = []

  if (contentType.includes('multipart/form-data')) {
    const parts = (await readMultipartFormData(event)) || []

    for (const part of parts) {
      if (!part.name) continue
      if (part.filename && part.data && part.data.length > 0) {
        if (pendingFiles.length >= MAX_FILES) {
          throw createError({
            statusCode: 400,
            statusMessage: `แนบไฟล์ได้สูงสุดครั้งละไม่เกิน ${MAX_FILES} ไฟล์`
          })
        }
        if (part.data.length > MAX_FILE_BYTES) {
          throw createError({
            statusCode: 400,
            statusMessage: `ไฟล์ "${part.filename}" มีขนาดใหญ่เกิน 20 MB`
          })
        }
        const safeOriginalName = path.basename(part.filename).replace(/[\x00-\x1f\x7f]/g, '').slice(0, 180)
        const ext = path.extname(safeOriginalName).toLowerCase()
        if (!ALLOWED_INQUIRY_EXTS.has(ext)) {
          await logSecurityEvent({
            event,
            eventType: 'upload_rejected',
            severity: 'warn',
            detail: `ปฏิเสธไฟล์แนบนามสกุลไม่อนุญาต: ${safeOriginalName}`
          })
          throw createError({
            statusCode: 400,
            statusMessage: `ไม่รองรับนามสกุลไฟล์ "${ext}" (รองรับเฉพาะ PDF, JPEG, PNG, Excel, Word และ PowerPoint)`
          })
        }

        const buf = Buffer.from(part.data)
        const sigCheck = validateFileSignature(buf, ext)
        if (!sigCheck.valid) {
          await logSecurityEvent({
            event,
            eventType: 'upload_rejected',
            severity: 'critical',
            detail: `บล็อกไฟล์ปลอมแปลงโครงสร้าง (Magic-Byte Mismatch): ${safeOriginalName} — ${sigCheck.reason}`
          })
          throw createError({
            statusCode: 400,
            statusMessage: `ไฟล์ "${safeOriginalName}" ไม่ผ่านการตรวจสอบความปลอดภัย (${sigCheck.reason})`
          })
        }

        pendingFiles.push({
          filename: safeOriginalName,
          data: buf,
          mime: part.type || 'application/octet-stream'
        })
      } else if (part.data) {
        fields[part.name] = part.data.toString('utf8')
      }
    }
  } else {
    const body = (await readBody(event)) || {}
    for (const [k, v] of Object.entries(body)) {
      if (v !== undefined && v !== null && typeof v !== 'object') {
        fields[k] = String(v)
      }
    }
  }

  // 2. Honeypot Anti-Bot Trap
  if (fields.website_url_hp && fields.website_url_hp.trim() !== '') {
    await logSecurityEvent({
      event,
      eventType: 'bot_honeypot_blocked',
      severity: 'warn',
      detail: 'ตรวจพบบอทสแปมกรอกช่อง Honeypot ซ่อนไว้ในหน้าติดต่อเรา'
    })
    throw createError({ statusCode: 400, statusMessage: 'คำขอไม่ผ่านการตรวจสอบระบบป้องกันสแปม' })
  }

  // 3. Server-Side Signed Math Challenge Verification (when submitted from Contact Us form)
  const source_channel = String(fields.source_channel || 'website').trim().slice(0, 40)
  if (source_channel === 'contact_page' || fields.challenge_token) {
    const okChallenge = verifyMathChallenge(
      String(fields.challenge_token || ''),
      String(fields.challenge_answer || ''),
      config.adminJwtSecret
    )
    if (!okChallenge) {
      throw createError({
        statusCode: 400,
        statusMessage: 'คำตอบยืนยันตัวตนไม่ถูกต้องหรือหมดอายุ กรุณาบวกเลขใหม่อีกครั้ง'
      })
    }
  }

  const customer_name = String(fields.customer_name || '').trim().slice(0, 150)
  const company_name = String(fields.company_name || '').trim().slice(0, 180)
  const email = String(fields.email || '').trim().slice(0, 150)
  const phone = String(fields.phone || '').trim().slice(0, 60)
  const line_id = String(fields.line_id || '').trim().slice(0, 100)
  const subject = String(fields.subject || 'ติดต่อสอบถาม / ขอใบเสนอราคา').trim().slice(0, 220)
  const message = String(fields.message || '').trim().slice(0, 5000)
  const product_id = fields.product_id ? Number(fields.product_id) : null
  const product_sku = String(fields.product_sku || '').trim().slice(0, 100)

  if (!customer_name || (!phone && !email && !line_id) || !message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'กรุณากรอกชื่อผู้ติดต่อ ช่องทางติดต่อกลับ (เบอร์โทร/อีเมล/LINE ID) และรายละเอียดข้อความให้ครบถ้วน'
    })
  }

  // Save validated attachments to disk only AFTER all security checks succeed
  const attachments: InquiryAttachmentMeta[] = []
  for (const pf of pendingFiles) {
    const ext = path.extname(pf.filename).toLowerCase()
    const savedUrl = saveUploadedBuffer({
      buffer: pf.data,
      originalFilename: pf.filename,
      mimeType: pf.mime,
      folder: 'inquiries'
    })
    attachments.push({
      name: pf.filename,
      url: savedUrl,
      size: pf.data.length,
      ext: ext.replace(/^\./, '').toUpperCase(),
      mime_type: pf.mime
    })
  }

  const now = new Date()
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const countRow = await dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM inquiries')
  const seq = String(Number(countRow?.cnt || 0) + 1).padStart(3, '0')
  const ref_code = `RFQ-${ym}-${seq}`

  const siteUrlRow = await dbQueryOne<{ setting_value: string }>(
    "SELECT setting_value FROM site_settings WHERE setting_key = 'site_url'"
  )
  const siteUrl = siteUrlRow?.setting_value || config.public.siteUrl || 'https://uat.csf.co.th'

  const lineAlert = await sendLineInquiryNotification({
    ref_code,
    customer_name,
    company_name,
    phone,
    email,
    line_id,
    subject,
    product_sku,
    message,
    attachments,
    siteUrl
  })

  const res = await dbExecute(
    `INSERT INTO inquiries
     (ref_code, customer_name, company_name, email, phone, line_id, subject, message, product_id, product_sku, attachments_json, source_channel, status, notified_line, notified_facebook)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, 0)`,
    [
      ref_code,
      customer_name,
      company_name,
      email,
      phone,
      line_id,
      subject,
      message,
      product_id,
      product_sku,
      attachments.length ? JSON.stringify(attachments) : null,
      source_channel,
      lineAlert.delivered ? 1 : 0
    ]
  )

  const lineCfg = await dbQueryOne<{
    display_name: string
    handle_or_url: string
    qr_code_url: string
    is_enabled: number
  }>("SELECT display_name, handle_or_url, qr_code_url, is_enabled FROM social_integrations WHERE platform = 'line_oa'")

  const rawHandle = lineCfg?.handle_or_url || '@csf.co.th'
  const cleanHandle = rawHandle.startsWith('http')
    ? '@csf.co.th'
    : rawHandle.startsWith('@')
      ? rawHandle
      : `@${rawHandle}`
  const addUrl = rawHandle.startsWith('http')
    ? rawHandle
    : `https://line.me/R/ti/p/${encodeURIComponent(cleanHandle)}`
  const prefillText = `สวัสดีครับ แจ้งเลขอ้างอิงติดต่อ ${ref_code} (${customer_name}${line_id ? ` / LINE: ${line_id}` : ''})`
  const oaChatUrl = rawHandle.startsWith('http')
    ? rawHandle
    : `https://line.me/R/oaMessage/${encodeURIComponent(cleanHandle)}/?${encodeURIComponent(prefillText)}`

  return {
    ok: true,
    id: res.insertId,
    ref_code,
    attachments,
    line_notification: lineAlert.mode,
    company_line_oa: {
      enabled: Boolean(lineCfg?.is_enabled ?? 1),
      display_name: lineCfg?.display_name || 'CSF Technology Touch Official',
      handle: cleanHandle,
      add_url: addUrl,
      oa_chat_url: oaChatUrl,
      qr_code_url: lineCfg?.qr_code_url || ''
    }
  }
})
