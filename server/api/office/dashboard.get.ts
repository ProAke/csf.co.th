import { requireAdmin } from '../../utils/auth'
import { dbQuery, dbQueryOne, getDbStatus } from '../../utils/db'

export default defineEventHandler(async event => {
  requireAdmin(event)

  const [dbStatus, newInquiriesRow, bannersRow, recentInquiries, recentSocialLogs, socialConfigs] = await Promise.all([
    getDbStatus(),
    dbQueryOne<{ cnt: number }>("SELECT COUNT(*) as cnt FROM inquiries WHERE status = 'new'"),
    dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM banners WHERE is_active = 1'),
    dbQuery('SELECT * FROM inquiries ORDER BY id DESC LIMIT 6'),
    dbQuery('SELECT * FROM social_logs ORDER BY id DESC LIMIT 8'),
    dbQuery('SELECT platform, display_name, handle_or_url, is_enabled, auto_reply_enabled, notify_on_inquiry, auto_publish_content FROM social_integrations')
  ])

  return {
    dbStatus,
    stats: {
      ...dbStatus.counts,
      newInquiries: Number(newInquiriesRow?.cnt || 0),
      activeBanners: Number(bannersRow?.cnt || 0)
    },
    recentInquiries,
    recentSocialLogs,
    socialConfigs
  }
})
