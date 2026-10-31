import { createError, getQuery, setResponseHeader } from 'h3'
import { dbQueryOne } from '../../utils/db'
import type { SocialConfigRow } from '../../utils/social'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const mode = String(query['hub.mode'] || '')
  const token = String(query['hub.verify_token'] || '')
  const challenge = String(query['hub.challenge'] || '')

  const fbCfg = await dbQueryOne<SocialConfigRow>('SELECT * FROM social_integrations WHERE platform = ?', ['facebook'])
  const expectedToken = fbCfg?.verify_token || process.env.FB_VERIFY_TOKEN || 'csf_fb_verify_2026'

  if (mode === 'subscribe' && token === expectedToken) {
    setResponseHeader(event, 'Content-Type', 'text/plain')
    return challenge
  }

  throw createError({ statusCode: 403, statusMessage: 'Facebook Webhook Verification Failed' })
})
