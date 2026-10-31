import { createError, getHeader, readRawBody } from 'h3'
import { dbExecute, dbQueryOne } from '../../utils/db'
import {
  buildLineProductFlexMessage,
  logSocialEvent,
  verifyLineSignature,
  type SocialConfigRow
} from '../../utils/social'

export default defineEventHandler(async event => {
  const rawBody = (await readRawBody(event, 'utf8')) || '{}'
  const signature = getHeader(event, 'x-line-signature')
  const config = useRuntimeConfig(event)

  const lineCfg = await dbQueryOne<SocialConfigRow>('SELECT * FROM social_integrations WHERE platform = ?', ['line_oa'])
  if (lineCfg && lineCfg.channel_secret) {
    const valid = verifyLineSignature(rawBody, signature, lineCfg.channel_secret)
    if (!valid) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid X-Line-Signature' })
    }
  }

  let parsed: any = {}
  try {
    parsed = JSON.parse(rawBody)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid JSON payload' })
  }

  const events = Array.isArray(parsed.events) ? parsed.events : []
  const repliesGenerated: any[] = []

  for (const ev of events) {
    const userId = ev?.source?.userId || 'U_GUEST'
    const replyToken = ev?.replyToken || ''

    if (ev.type === 'follow') {
      const welcome =
        lineCfg?.welcome_message ||
        'ยินดีต้อนรับสู่ CSF Technology Touch! พิมพ์รหัสสินค้าหรือแจ้งขอใบเสนอราคาได้เลยครับ'
      await logSocialEvent({
        platform: 'line_oa',
        direction: 'inbound',
        event_type: 'follow',
        sender_or_target: userId,
        summary: `ผู้ใช้งานใหม่เพิ่มเพื่อน LINE OA (${userId})`,
        payload: ev,
        status: 'received'
      })
      repliesGenerated.push({ type: 'text', text: welcome })
      continue
    }

    if (ev.type === 'message' && ev.message?.type === 'text') {
      const text = String(ev.message.text || '').trim()
      await logSocialEvent({
        platform: 'line_oa',
        direction: 'inbound',
        event_type: 'message.text',
        sender_or_target: userId,
        summary: `ข้อความเข้าจาก LINE OA: "${text.slice(0, 120)}"`,
        payload: ev,
        status: 'received'
      })

      // Check if message matches a product SKU or product keyword
      const matchedProduct = await dbQueryOne<any>(
        `SELECT sku, slug, name, subtitle, brand, price_display, stock_status
         FROM products
         WHERE is_active = 1 AND (LOWER(sku) LIKE ? OR LOWER(name) LIKE ?)
         ORDER BY is_featured DESC LIMIT 1`,
        [`%${text.toLowerCase()}%`, `%${text.toLowerCase()}%`]
      )

      if (lineCfg?.auto_reply_enabled) {
        let replyMessage: any
        if (matchedProduct) {
          replyMessage = buildLineProductFlexMessage({
            ...matchedProduct,
            siteUrl: config.public.siteUrl || 'https://uat.csf.co.th'
          })
        } else {
          replyMessage = {
            type: 'text',
            text: `ขอบคุณที่ติดต่อ บริษัท ซีเอสเอฟ จำกัด (CSF Technology Touch)\nทีมฝ่ายขายได้รับข้อความ "${text.slice(0, 60)}" แล้ว และจะติดต่อกลับโดยเร็วที่สุด (โทรด่วน 081-308-9678)`
          }
        }

        repliesGenerated.push(replyMessage)

        if (lineCfg.access_token && replyToken && replyToken !== '00000000000000000000000000000000') {
          try {
            await fetch('https://api.line.me/v2/bot/message/reply', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${lineCfg.access_token}`
              },
              body: JSON.stringify({ replyToken, messages: [replyMessage] })
            })
          } catch {
            // Ignore external fetch error in sandbox
          }
        }

        await logSocialEvent({
          platform: 'line_oa',
          direction: 'outbound',
          event_type: matchedProduct ? 'auto_reply.flex_product' : 'auto_reply.text',
          sender_or_target: userId,
          summary: matchedProduct
            ? `ตอบกลับอัตโนมัติด้วย LINE Flex Card สินค้า ${matchedProduct.sku}`
            : `ตอบกลับข้อความต้อนรับอัตโนมัติไปยัง ${userId}`,
          payload: replyMessage,
          status: 'auto_replied'
        })
      }

      // If customer asks for quote / price, automatically log as CRM inquiry
      if (/ราคา|ใบเสนอราคา|quote|สั่งซื้อ|ติดต่อ|สนใจ/i.test(text) || matchedProduct) {
        const countRow = await dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM inquiries')
        const ref = `LINE-${String(Number(countRow?.cnt || 0) + 1).padStart(4, '0')}`
        await dbExecute(
          `INSERT INTO inquiries (ref_code, customer_name, line_id, subject, message, product_sku, source_channel, status, notified_line)
           VALUES (?, ?, ?, ?, ?, ?, 'line_oa', 'new', 1)`,
          [
            ref,
            `ลูกค้า LINE OA (${userId.slice(0, 10)})`,
            userId,
            matchedProduct ? `สอบถามสินค้า ${matchedProduct.sku} ผ่าน LINE OA` : 'ข้อความสอบถามจาก LINE OA',
            text,
            matchedProduct?.sku || ''
          ]
        )
      }
    }
  }

  return { ok: true, processed: events.length, replies: repliesGenerated }
})
