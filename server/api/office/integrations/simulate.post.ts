import { readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { dbExecute, dbQueryOne } from '../../../utils/db'
import { buildLineProductFlexMessage, logSocialEvent, type SocialConfigRow } from '../../../utils/social'

export default defineEventHandler(async event => {
  requireAdmin(event)
  const config = useRuntimeConfig(event)
  const body = await readBody(event)

  const platform = body?.platform === 'facebook' ? 'facebook' : 'line_oa'
  const text = String(body?.text || 'สนใจขอใบเสนอราคา DSP501').trim()
  const customerLabel = String(body?.customer || (platform === 'line_oa' ? 'U_SIM_CUSTOMER_88' : 'PSID_SIM_9901')).trim()

  await logSocialEvent({
    platform,
    direction: 'inbound',
    event_type: platform === 'line_oa' ? 'webhook.test.message' : 'messenger.test.message',
    sender_or_target: customerLabel,
    summary: `[ทดสอบ Webhook] ข้อความลูกค้า: "${text}"`,
    payload: { platform, sender: customerLabel, text },
    status: 'received'
  })

  const matchedProduct = await dbQueryOne<any>(
    `SELECT sku, slug, name, subtitle, brand, price_display, stock_status
     FROM products
     WHERE is_active = 1 AND (LOWER(sku) LIKE ? OR LOWER(name) LIKE ?)
     ORDER BY is_featured DESC LIMIT 1`,
    [`%${text.toLowerCase()}%`, `%${text.toLowerCase()}%`]
  )

  const cfg = await dbQueryOne<SocialConfigRow>('SELECT * FROM social_integrations WHERE platform = ?', [platform])
  let autoReplyPreview: any = null

  if (cfg?.auto_reply_enabled) {
    if (platform === 'line_oa' && matchedProduct) {
      autoReplyPreview = buildLineProductFlexMessage({
        ...matchedProduct,
        siteUrl: config.public.siteUrl || 'https://uat.csf.co.th'
      })
    } else {
      autoReplyPreview = {
        type: 'text',
        text:
          cfg.welcome_message ||
          `สวัสดีครับ ทีมงาน CSF Technology Touch ได้รับข้อความ "${text}" เรียบร้อยแล้ว`
      }
    }

    await logSocialEvent({
      platform,
      direction: 'outbound',
      event_type: matchedProduct ? 'auto_reply.flex_product' : 'auto_reply.text',
      sender_or_target: customerLabel,
      summary: matchedProduct
        ? `ระบบตอบกลับอัตโนมัติด้วยข้อมูลสินค้า [${matchedProduct.sku}] ${matchedProduct.name}`
        : `ระบบส่งข้อความต้อนรับอัตโนมัติไปยัง ${customerLabel}`,
      payload: autoReplyPreview,
      status: 'auto_replied'
    })
  }

  const countRow = await dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM inquiries')
  const prefix = platform === 'line_oa' ? 'LINE' : 'FB'
  const ref = `${prefix}-SIM-${String(Number(countRow?.cnt || 0) + 1).padStart(3, '0')}`
  await dbExecute(
    `INSERT INTO inquiries (ref_code, customer_name, line_id, subject, message, product_sku, source_channel, status, notified_line, notified_facebook)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)`,
    [
      ref,
      `ลูกค้าจำลอง (${customerLabel})`,
      platform === 'line_oa' ? customerLabel : '',
      matchedProduct ? `สอบถามสินค้า ${matchedProduct.sku} (${platform.toUpperCase()})` : `ข้อความจาก ${platform.toUpperCase()}`,
      text,
      matchedProduct?.sku || '',
      platform,
      platform === 'line_oa' ? 1 : 0,
      platform === 'facebook' ? 1 : 0
    ]
  )

  return {
    ok: true,
    inquiry_ref: ref,
    matched_product: matchedProduct || null,
    auto_reply_preview: autoReplyPreview
  }
})
