import { createError, readBody, setCookie, setHeader } from 'h3'
import {
  ADMIN_COOKIE_NAME,
  DUMMY_PASSWORD_HASH,
  computePasswordFingerprint,
  signAdminToken,
  verifyPassword
} from '../../utils/auth'
import { dbExecute, dbQueryOne } from '../../utils/db'
import { checkRateLimit, getClientIp, isRequestHttps, logSecurityEvent, resetRateLimit } from '../../utils/security'

const MAX_LOGIN_ATTEMPTS = 5
const LOGIN_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const SESSION_TTL_SEC = 60 * 60 * 8 // 8 hours

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  const body = await readBody(event)
  const username = String(body?.username || '').trim().slice(0, 100)
  const password = String(body?.password || '').slice(0, 200)

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน' })
  }

  // Brute-force check per IP & username
  const ipLimit = checkRateLimit('office_login_ip', ip, MAX_LOGIN_ATTEMPTS, LOGIN_WINDOW_MS)
  const userLimit = checkRateLimit('office_login_user', username.toLowerCase(), MAX_LOGIN_ATTEMPTS, LOGIN_WINDOW_MS)

  if (!ipLimit.allowed || !userLimit.allowed) {
    const retrySec = Math.max(ipLimit.retryAfterSec, userLimit.retryAfterSec)
    setHeader(event, 'Retry-After', String(retrySec))
    await logSecurityEvent({
      event,
      eventType: 'brute_force_blocked',
      severity: 'critical',
      actor: username,
      detail: `ระงับการล็อกอินชั่วคราวเนื่องจากใส่รหัสผิดเกิน ${MAX_LOGIN_ATTEMPTS} ครั้ง (รอ ${Math.ceil(retrySec / 60)} นาที)`
    })
    throw createError({
      statusCode: 429,
      statusMessage: `พยายามเข้าสู่ระบบผิดพลาดเกินกำหนด กรุณารอ ${Math.ceil(retrySec / 60)} นาทีแล้วลองใหม่`
    })
  }

  const user = await dbQueryOne<{
    id: number
    username: string
    email: string
    password_hash: string
    full_name: string
    role: string
    is_active: number
  }>('SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1', [username, username])

  // Constant-time verification even if user does not exist (prevents timing enumeration)
  const targetHash = user ? user.password_hash : DUMMY_PASSWORD_HASH
  const passwordValid = verifyPassword(password, targetHash)

  if (!user || !passwordValid) {
    await logSecurityEvent({
      event,
      eventType: 'login_failed',
      severity: 'warn',
      actor: username,
      detail: `ล็อกอินเข้า /office ไม่สำเร็จ (เหลือโอกาส ${Math.min(ipLimit.remaining, userLimit.remaining)} ครั้ง)`
    })
    throw createError({ statusCode: 401, statusMessage: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' })
  }

  // Clear failed login counters upon successful login
  resetRateLimit('office_login_ip', ip)
  resetRateLimit('office_login_user', username.toLowerCase())

  await dbExecute('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id])

  const jwtSecret = getJwtSecretRuntime(event)
  const token = signAdminToken(
    {
      sub: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      pwd_sig: computePasswordFingerprint(user.password_hash, jwtSecret)
    },
    jwtSecret,
    SESSION_TTL_SEC
  )

  setCookie(event, ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isRequestHttps(event),
    path: '/',
    maxAge: SESSION_TTL_SEC,
    sameSite: 'lax'
  })

  await logSecurityEvent({
    event,
    eventType: 'login_success',
    severity: 'info',
    actor: user.username,
    detail: `เข้าสู่ระบบหลังบ้าน (/office) สำเร็จด้วยเซสชัน HttpOnly Cookie (อายุ 8 ชม.)`
  })

  return {
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    }
  }
})
