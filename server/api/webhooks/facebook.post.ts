import { createError, getHeader, readRawBody } from 'h3'
import { dbExecute, dbQueryOne } from '../../utils/db'
import { logSocialEvent, verifyFacebookSignature, type SocialConfigRow } from '../../utils/social'

export default defineEventHandler(async event => {
  const rawBody = (await readRawBody(event, 'utf8')) || '{}'
  const sigHeader = getHeader(event, 'x-hub-signature-256')

  const fbCfg = await dbQueryOne<SocialConfigRow>('SELECT * FROM social_integrations WHERE platform = ?', ['facebook'])
  if (fbCfg && fbCfg.channel_secret) {
    if (!verifyFacebookSignature(rawBody, sigHeader, fbCfg.channel_secret)) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid X-Hub-Signature-256' })
    }
  }

  let body: any = {}
  try {
    body = JSON.parse(rawBody)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid JSON' })
  }

  const entries = Array.isArray(body.entry) ? body.entry : []
  let processed = 0
  const autoReplies: string[] = []

  for (const entry of entries) {
    const messaging = Array.isArray(entry.messaging) ? entry.messaging : []
    for (const msgEvent of messaging) {
      const senderId = msgEvent?.sender?.id || 'FB_USER'
      const text = String(msgEvent?.message?.text || '').trim()
      if (!text) continue

      processed++
      await logSocialEvent({
        platform: 'facebook',
        direction: 'inbound',
        event_type: 'messenger.text',
        sender_or_target: `PSID:${senderId}`,
        summary: `ข้อความเข้าจาก Facebook Messenger: "${text.slice(0, 120)}"`,
        payload: msgEvent,
        status: 'received'
      })

      const countRow = await dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM inquiries')
      const ref = `FB-${String(Number(countRow?.cnt || 0) + 1).padStart(4, '0')}`
      await dbExecute(
        `INSERT INTO inquiries (ref_code, customer_name, subject, message, source_channel, status, notified_facebook)
         VALUES (?, ?, ?, ?, 'facebook', 'new', 1)`,
        [ref, `ลูกค้า Facebook (${senderId.slice(0, 10)})`, 'ข้อความสอบถามผ่านเพจ Facebook Messenger', text]
      )

      if (fbCfg?.auto_reply_enabled) {
        const replyText =
          fbCfg.welcome_message ||
          'ขอบคุณที่ทักแชทเพจ CSF Technology Touch ครับ ฝ่ายขายได้รับข้อความแล้วและจะรีบติดต่อกลับครับ'
        autoReplies.push(replyText)
        await logSocialEvent({
          platform: 'facebook',
          direction: 'outbound',
          event_type: 'messenger.auto_reply',
          sender_or_target: `PSID:${senderId}`,
          summary: `ส่งข้อความตอบกลับอัตโนมัติผ่าน Facebook Messenger`,
          payload: { recipient: { id: senderId }, message: { text: replyText } },
          status: 'auto_replied'
        })
      }
    }
  }

  return { status: 'EVENT_RECEIVED', processed, autoReplies }
})
