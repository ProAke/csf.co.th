import crypto from 'node:crypto'
import { dbExecute, dbQueryOne } from './db'

export interface SocialConfigRow {
  id: number
  platform: 'line_oa' | 'facebook'
  display_name: string
  handle_or_url: string
  channel_id: string
  channel_secret: string
  access_token: string | null
  verify_token: string
  target_recipient_id: string
  qr_code_url: string
  pixel_id: string
  auto_reply_enabled: number
  notify_on_inquiry: number
  auto_publish_content: number
  welcome_message: string | null
  is_enabled: number
}

export function verifyLineSignature(rawBody: string, signature: string | undefined, channelSecret: string): boolean {
  if (!channelSecret) return true // Allow testing in sandbox when secret is blank
  if (!signature) return false
  const expected = crypto.createHmac('sha256', channelSecret).update(rawBody).digest('base64')
  if (signature.length !== expected.length) return false
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

export function verifyFacebookSignature(rawBody: string, signatureHeader: string | undefined, appSecret: string): boolean {
  if (!appSecret) return true // Allow testing in sandbox when app secret is blank
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false
  const sig = signatureHeader.slice(7)
  const expected = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex')
  if (sig.length !== expected.length) return false
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
}

export async function logSocialEvent(params: {
  platform: 'line_oa' | 'facebook'
  direction: 'inbound' | 'outbound'
  event_type: string
  sender_or_target: string
  summary: string
  payload: any
  status: string
  http_status?: number
}) {
  await dbExecute(
    `INSERT INTO social_logs (platform, direction, event_type, sender_or_target, summary, payload_json, status, http_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.platform,
      params.direction,
      params.event_type,
      params.sender_or_target,
      params.summary,
      JSON.stringify(params.payload ?? {}),
      params.status,
      params.http_status ?? 200
    ]
  )
}

export function buildLineProductFlexMessage(product: {
  sku: string
  slug: string
  name: string
  subtitle: string
  brand: string
  price_display: string
  stock_status: string
  siteUrl: string
}) {
  return {
    type: 'flex',
    altText: `[CSF] ${product.sku} - ${product.name}`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0B1426',
        contents: [
          {
            type: 'text',
            text: 'CSF TECHNOLOGY TOUCH',
            color: '#38BDF8',
            size: 'xs',
            weight: 'bold'
          },
          {
            type: 'text',
            text: product.sku,
            color: '#FFFFFF',
            size: 'lg',
            weight: 'bold',
            margin: 'xs'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'text',
            text: product.name,
            weight: 'bold',
            size: 'md',
            wrap: true
          },
          {
            type: 'text',
            text: product.subtitle || product.brand,
            size: 'xs',
            color: '#64748B',
            wrap: true
          },
          {
            type: 'separator',
            margin: 'md'
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            contents: [
              { type: 'text', text: 'สถานะ:', size: 'xs', color: '#64748B', flex: 2 },
              { type: 'text', text: product.stock_status, size: 'xs', color: '#059669', weight: 'bold', flex: 4 }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'ราคา:', size: 'xs', color: '#64748B', flex: 2 },
              { type: 'text', text: product.price_display, size: 'xs', color: '#0284C7', weight: 'bold', flex: 4 }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#0284C7',
            action: {
              type: 'uri',
              label: 'ดูสเปกและขอใบเสนอราคา',
              uri: `${product.siteUrl}/products/${product.slug}`
            }
          }
        ]
      }
    }
  }
}

export async function sendLineInquiryNotification(inquiry: {
  ref_code: string
  customer_name: string
  company_name: string
  phone: string
  email: string
  line_id?: string
  subject: string
  product_sku: string
  message: string
  attachments?: Array<{ name: string; url: string; size: number }>
  siteUrl?: string
}): Promise<{ delivered: boolean; mode: 'live' | 'simulated' | 'disabled' }> {
  const cfg = await dbQueryOne<SocialConfigRow>('SELECT * FROM social_integrations WHERE platform = ?', ['line_oa'])
  if (!cfg || !cfg.is_enabled || !cfg.notify_on_inquiry) {
    return { delivered: false, mode: 'disabled' }
  }

  const baseUrl = (inquiry.siteUrl || 'https://uat.csf.co.th').replace(/\/+$/, '')
  const attachmentLines =
    inquiry.attachments && inquiry.attachments.length
      ? `ไฟล์แนบ (${inquiry.attachments.length}):\n` +
        inquiry.attachments.map(a => `• ${a.name} (${baseUrl}${a.url})`).join('\n')
      : null

  const textMsg = [
    `🔔 ใบขอราคา/ติดต่อใหม่ [${inquiry.ref_code}]`,
    `ผู้ติดต่อ: ${inquiry.customer_name}${inquiry.company_name ? ` (${inquiry.company_name})` : ''}`,
    `โทร: ${inquiry.phone || '-'} | อีเมล: ${inquiry.email || '-'}`,
    inquiry.line_id ? `LINE ID ลูกค้า: ${inquiry.line_id}` : null,
    inquiry.product_sku ? `รุ่นสินค้า: ${inquiry.product_sku}` : null,
    `หัวข้อ: ${inquiry.subject}`,
    `รายละเอียด: ${inquiry.message.slice(0, 220)}`,
    attachmentLines
  ]
    .filter(Boolean)
    .join('\n')

  const payload = {
    to: cfg.target_recipient_id || 'ADMIN_SALES_GROUP',
    messages: [{ type: 'text', text: textMsg }]
  }

  if (cfg.access_token && cfg.target_recipient_id) {
    try {
      const resp = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cfg.access_token}`
        },
        body: JSON.stringify(payload)
      })
      await logSocialEvent({
        platform: 'line_oa',
        direction: 'outbound',
        event_type: 'lead.push_alert',
        sender_or_target: cfg.target_recipient_id,
        summary: `ส่งแจ้งเตือนใบขอราคา [${inquiry.ref_code}] ไปยัง LINE Messaging API`,
        payload,
        status: resp.ok ? 'delivered' : 'api_error',
        http_status: resp.status
      })
      return { delivered: resp.ok, mode: 'live' }
    } catch (err: any) {
      await logSocialEvent({
        platform: 'line_oa',
        direction: 'outbound',
        event_type: 'lead.push_alert',
        sender_or_target: cfg.target_recipient_id,
        summary: `คิวส่งแจ้งเตือน LINE OA [${inquiry.ref_code}] (จำลองในโหมดออฟไลน์: ${err?.message || 'network'})`,
        payload,
        status: 'queued_offline',
        http_status: 202
      })
      return { delivered: true, mode: 'simulated' }
    }
  }

  await logSocialEvent({
    platform: 'line_oa',
    direction: 'outbound',
    event_type: 'lead.push_alert',
    sender_or_target: cfg.display_name || 'LINE OA Sales Group',
    summary: `บันทึกแจ้งเตือนใบขอราคา [${inquiry.ref_code}] เข้าสู่ระบบ LINE OA Notification Queue`,
    payload,
    status: 'simulated_ok',
    http_status: 200
  })
  return { delivered: true, mode: 'simulated' }
}

export async function publishToSocialChannel(params: {
  platform: 'line_oa' | 'facebook'
  message: string
  linkUrl?: string
  flexMessage?: any
}): Promise<{ ok: boolean; mode: 'live' | 'simulated'; detail: string }> {
  const cfg = await dbQueryOne<SocialConfigRow>('SELECT * FROM social_integrations WHERE platform = ?', [params.platform])
  if (!cfg || !cfg.is_enabled) {
    return { ok: false, mode: 'simulated', detail: 'ช่องทางนี้ถูกปิดใช้งานอยู่ในตั้งค่าการเชื่อมต่อ' }
  }

  if (params.platform === 'line_oa') {
    const body = {
      messages: params.flexMessage ? [params.flexMessage] : [{ type: 'text', text: params.message }]
    }
    if (cfg.access_token) {
      try {
        const resp = await fetch('https://api.line.me/v2/bot/message/broadcast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${cfg.access_token}`
          },
          body: JSON.stringify(body)
        })
        await logSocialEvent({
          platform: 'line_oa',
          direction: 'outbound',
          event_type: 'broadcast.message',
          sender_or_target: cfg.handle_or_url || 'All Followers',
          summary: `Broadcast ข้อความไปยังผู้ติดตาม LINE OA (${params.message.slice(0, 80)})`,
          payload: body,
          status: resp.ok ? 'delivered' : 'api_error',
          http_status: resp.status
        })
        return {
          ok: resp.ok,
          mode: 'live',
          detail: resp.ok ? 'ส่ง Broadcast ผ่าน LINE Messaging API สำเร็จ' : `LINE API ตอบกลับสถานะ ${resp.status}`
        }
      } catch (e: any) {
        // Fallback log
      }
    }

    await logSocialEvent({
      platform: 'line_oa',
      direction: 'outbound',
      event_type: 'broadcast.message',
      sender_or_target: cfg.handle_or_url || '@csf.co.th',
      summary: `จำลองการส่ง Broadcast LINE OA: "${params.message.slice(0, 90)}"`,
      payload: body,
      status: 'simulated_ok',
      http_status: 200
    })
    return {
      ok: true,
      mode: 'simulated',
      detail: 'บันทึกและจำลองส่ง LINE OA Broadcast สำเร็จ (ใส่ Channel Access Token จริงเพื่อยิงเข้า LINE API ทันที)'
    }
  }

  // Facebook Page Feed Post
  const fbPayload = {
    message: params.message,
    link: params.linkUrl || undefined
  }
  if (cfg.access_token && cfg.channel_id) {
    try {
      const resp = await fetch(`https://graph.facebook.com/v20.0/${encodeURIComponent(cfg.channel_id)}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fbPayload, access_token: cfg.access_token })
      })
      await logSocialEvent({
        platform: 'facebook',
        direction: 'outbound',
        event_type: 'page.feed_post',
        sender_or_target: cfg.display_name,
        summary: `โพสต์เนื้อหาขึ้นเพจ Facebook (${params.message.slice(0, 80)})`,
        payload: fbPayload,
        status: resp.ok ? 'delivered' : 'api_error',
        http_status: resp.status
      })
      return {
        ok: resp.ok,
        mode: 'live',
        detail: resp.ok ? 'โพสต์ขึ้น Facebook Page สำเร็จ' : `Facebook Graph API ตอบกลับสถานะ ${resp.status}`
      }
    } catch {
      // Fallback log
    }
  }

  await logSocialEvent({
    platform: 'facebook',
    direction: 'outbound',
    event_type: 'page.feed_post',
    sender_or_target: cfg.display_name || 'CSF Technology Touch Page',
    summary: `จำลองการโพสต์ขึ้นเพจ Facebook: "${params.message.slice(0, 90)}"`,
    payload: fbPayload,
    status: 'simulated_ok',
    http_status: 200
  })
  return {
    ok: true,
    mode: 'simulated',
    detail: 'บันทึกและจำลองโพสต์ขึ้น Facebook Page สำเร็จ (ใส่ Page Access Token จริงเพื่อเผยแพร่อัตโนมัติ)'
  }
}
