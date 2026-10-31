import { requireAdmin } from '../../../utils/auth'
import { dbExecute } from '../../../utils/db'
import { logSecurityEvent } from '../../../utils/security'

export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event)
  await dbExecute('DELETE FROM security_logs')
  await logSecurityEvent({
    event,
    eventType: 'logs_cleared',
    severity: 'info',
    actor: admin.username,
    detail: 'ผู้ดูแลระบบล้างประวัติบันทึกความปลอดภัย (Security Audit Logs)'
  })
  return { ok: true }
})
