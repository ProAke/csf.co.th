import { requireAdmin } from '../../../utils/auth'
import { dbQuery } from '../../../utils/db'

export default defineEventHandler(async event => {
  requireAdmin(event)
  const rows = await dbQuery<{ setting_key: string; setting_value: string; setting_group: string }>(
    'SELECT setting_key, setting_value, setting_group FROM site_settings'
  )
  const settings: Record<string, any> = {}
  for (const r of rows) {
    if (r.setting_key === 'vision_pillars') {
      try {
        settings[r.setting_key] = JSON.parse(r.setting_value)
      } catch {
        settings[r.setting_key] = []
      }
    } else {
      settings[r.setting_key] = r.setting_value
    }
  }
  return { settings }
})
