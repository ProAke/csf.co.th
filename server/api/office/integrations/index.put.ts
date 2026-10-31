import { createError, readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { dbExecute } from '../../../utils/db'
import { localizeExternalAssetUrl } from '../../../utils/media'

export default defineEventHandler(async event => {
  requireAdmin(event)
  const body = await readBody(event)
  const platform = String(body?.platform || '').trim()
  if (platform !== 'line_oa' && platform !== 'facebook') {
    throw createError({ statusCode: 400, statusMessage: 'Platform ต้องเป็น line_oa หรือ facebook' })
  }

  const localizedQr = await localizeExternalAssetUrl(String(body?.qr_code_url || '').trim(), { folder: 'brand' })

  await dbExecute(
    `UPDATE social_integrations
     SET display_name = ?, handle_or_url = ?, channel_id = ?, channel_secret = ?, access_token = ?, verify_token = ?, target_recipient_id = ?, qr_code_url = ?, pixel_id = ?, auto_reply_enabled = ?, notify_on_inquiry = ?, auto_publish_content = ?, welcome_message = ?, is_enabled = ?, updated_at = CURRENT_TIMESTAMP
     WHERE platform = ?`,
    [
      String(body?.display_name || '').trim(),
      String(body?.handle_or_url || '').trim(),
      String(body?.channel_id || '').trim(),
      String(body?.channel_secret || '').trim(),
      String(body?.access_token || '').trim(),
      String(body?.verify_token || '').trim(),
      String(body?.target_recipient_id || '').trim(),
      localizedQr.localUrl,
      String(body?.pixel_id || '').trim(),
      body?.auto_reply_enabled ? 1 : 0,
      body?.notify_on_inquiry ? 1 : 0,
      body?.auto_publish_content ? 1 : 0,
      String(body?.welcome_message || '').trim(),
      body?.is_enabled ? 1 : 0,
      platform
    ]
  )

  return { ok: true, qr_code_url: localizedQr.localUrl }
})
