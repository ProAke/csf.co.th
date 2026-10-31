import { createError, readBody, setCookie } from 'h3'
import {
  ADMIN_COOKIE_NAME,
  computePasswordFingerprint,
  hashPassword,
  requireAdmin,
  signAdminToken,
  verifyPassword
} from '../../../utils/auth'
import { dbExecute, dbQueryOne } from '../../../utils/db'
import { isRequestHttps, logSecurityEvent } from '../../../utils/security'

const SESSION_TTL_SEC = 60 * 60 * 8

export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event)
  const config = useRuntimeConfig(event)
  const body = await readBody(event)

  const currentPassword = String(body?.current_password || '')
  const newPassword = String(body?.new_password || '')
  const confirmPassword = String(body?.confirm_password || '')

  if (!currentPassword || !newPassword) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่ให้ครบถ้วน' })
  }

  if (newPassword !== confirmPassword) {
    throw createError({ statusCode: 400, statusMessage: 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน' })
  }

  if (newPassword.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร' })
  }

  if (!/[A-Za-z]/.test(newPassword) || !/[0-9!@#$%^&*()_+\-=]/.test(newPassword)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'รหัสผ่านใหม่ต้องประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลขหรืออักขระพิเศษอย่างน้อย 1 ตัว'
    })
  }

  const user = await dbQueryOne<{
    id: number
    username: string
    full_name: string
    role: string
    password_hash: string
  }>('SELECT id, username, full_name, role, password_hash FROM users WHERE id = ?', [admin.sub])

  if (!user || !verifyPassword(currentPassword, user.password_hash)) {
    await logSecurityEvent({
      event,
      eventType: 'password_change_failed',
      severity: 'warn',
      actor: admin.username,
      detail: 'พยายามเปลี่ยนรหัสผ่านแต่ระบุรหัสผ่านปัจจุบันไม่ถูกต้อง'
    })
    throw createError({ statusCode: 401, statusMessage: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' })
  }

  const newHash = hashPassword(newPassword)
  await dbExecute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id])

  // Rotate session cookie with updated password fingerprint (invalidates any stolen/other tokens!)
  const newToken = signAdminToken(
    {
      sub: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      pwd_sig: computePasswordFingerprint(newHash, config.adminJwtSecret)
    },
    config.adminJwtSecret,
    SESSION_TTL_SEC
  )

  setCookie(event, ADMIN_COOKIE_NAME, newToken, {
    httpOnly: true,
    secure: isRequestHttps(event),
    path: '/',
    maxAge: SESSION_TTL_SEC,
    sameSite: 'lax'
  })

  await logSecurityEvent({
    event,
    eventType: 'password_changed',
    severity: 'info',
    actor: user.username,
    detail: 'เปลี่ยนรหัสผ่านผู้ดูแลระบบและเพิกถอน Token เก่าทั้งหมดเรียบร้อยแล้ว'
  })

  return { ok: true }
})
