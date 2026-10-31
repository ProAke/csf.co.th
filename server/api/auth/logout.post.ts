import { deleteCookie } from 'h3'
import { ADMIN_COOKIE_NAME, getAdminFromEvent } from '../../utils/auth'
import { logSecurityEvent } from '../../utils/security'

export default defineEventHandler(async (event) => {
  const admin = getAdminFromEvent(event)
  deleteCookie(event, ADMIN_COOKIE_NAME, { path: '/' })
  if (admin) {
    await logSecurityEvent({
      event,
      eventType: 'logout',
      severity: 'info',
      actor: admin.username,
      detail: 'ผู้ดูแลระบบออกจากระบบ (/office) และล้างคุกกี้เซสชัน'
    })
  }
  return { ok: true }
})
