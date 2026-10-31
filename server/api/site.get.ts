import { dbQuery } from '../utils/db'

export default defineEventHandler(async () => {
  const [settingRows, categories, socialRows] = await Promise.all([
    dbQuery<{ setting_key: string; setting_value: string }>('SELECT setting_key, setting_value FROM site_settings'),
    dbQuery('SELECT id, slug, name_th, name_en, description, icon, image_url, sort_order FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'),
    dbQuery<{
      platform: string
      display_name: string
      handle_or_url: string
      qr_code_url: string
      pixel_id: string
      welcome_message: string
      is_enabled: number
    }>('SELECT platform, display_name, handle_or_url, qr_code_url, pixel_id, welcome_message, is_enabled FROM social_integrations')
  ])

  const settings: Record<string, any> = {}
  for (const row of settingRows) {
    if (row.setting_key === 'vision_pillars') {
      try {
        settings[row.setting_key] = JSON.parse(row.setting_value)
      } catch {
        settings[row.setting_key] = []
      }
    } else {
      settings[row.setting_key] = row.setting_value
    }
  }

  const social: Record<string, any> = {}
  for (const s of socialRows) {
    social[s.platform] = {
      display_name: s.display_name,
      handle_or_url: s.handle_or_url,
      qr_code_url: s.qr_code_url,
      pixel_id: s.pixel_id,
      welcome_message: s.welcome_message,
      is_enabled: Boolean(s.is_enabled)
    }
  }

  return {
    settings,
    categories,
    social
  }
})
