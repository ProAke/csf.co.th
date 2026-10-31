import { readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { dbExecute, dbQueryOne } from '../../../utils/db'
import { localizeExternalAssetUrl } from '../../../utils/media'

const ASSET_SETTING_KEYS = new Set(['site_logo', 'site_favicon', 'og_image'])

export default defineEventHandler(async event => {
  requireAdmin(event)
  const body = await readBody(event)
  const updates = body?.settings || {}

  for (const [key, val] of Object.entries(updates)) {
    let serialized = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '')
    if (ASSET_SETTING_KEYS.has(key) && serialized.startsWith('http')) {
      const localized = await localizeExternalAssetUrl(serialized, {
        folder: 'brand',
        exactRelativePath: key === 'site_logo' ? '/uploads/brand/csf_logo.png' : undefined
      })
      serialized = localized.localUrl
    }
    const exists = await dbQueryOne<{ setting_key: string }>('SELECT setting_key FROM site_settings WHERE setting_key = ?', [key])
    if (exists) {
      await dbExecute('UPDATE site_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?', [
        serialized,
        key
      ])
    } else {
      await dbExecute('INSERT INTO site_settings (setting_key, setting_value, setting_group) VALUES (?, ?, ?)', [
        key,
        serialized,
        'general'
      ])
    }
  }

  return { ok: true }
})
