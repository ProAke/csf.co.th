import crypto from 'node:crypto'
import type { H3Event } from 'h3'
import { createError, getCookie } from 'h3'

export const ADMIN_COOKIE_NAME = 'csf_office_session'

const PBKDF2_ITERATIONS = 100000
const DUMMY_SALT = '0123456789abcdef0123456789abcdef'
const DUMMY_DERIVED = crypto.pbkdf2Sync('dummy-constant-time-guard', DUMMY_SALT, PBKDF2_ITERATIONS, 64, 'sha512').toString('hex')
export const DUMMY_PASSWORD_HASH = `${DUMMY_SALT}:${DUMMY_DERIVED}`

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const derived = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 64, 'sha512').toString('hex')
  return `${salt}:${derived}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':')
  if (!salt || !key) return false
  const derived = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 64, 'sha512').toString('hex')
  const a = Buffer.from(key, 'hex')
  const b = Buffer.from(derived, 'hex')
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export function computePasswordFingerprint(passwordHash: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(passwordHash).digest('hex').slice(0, 16)
}

export interface AdminTokenPayload {
  sub: number
  username: string
  full_name: string
  role: string
  pwd_sig?: string
  iat: number
  exp: number
}

export function signAdminToken(
  payload: Omit<AdminTokenPayload, 'exp' | 'iat'>,
  secret: string,
  ttlSeconds = 60 * 60 * 8
): string {
  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: now,
      exp: now + ttlSeconds
    })
  ).toString('base64url')
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${signature}`
}

export function verifyAdminToken(token: string, secret: string): AdminTokenPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [header, body, sig] = parts
    const expected = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
    if (sig.length !== expected.length) return null
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as AdminTokenPayload
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null
    return parsed
  } catch {
    return null
  }
}

export function getAdminFromEvent(event: H3Event): AdminTokenPayload | null {
  const config = useRuntimeConfig(event)
  const authHeader = event.node.req.headers['authorization']
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim()
    const verified = verifyAdminToken(bearer, config.adminJwtSecret)
    if (verified) return verified
  }
  const token = getCookie(event, ADMIN_COOKIE_NAME)
  if (!token) return null
  return verifyAdminToken(token, config.adminJwtSecret)
}

export function requireAdmin(event: H3Event): AdminTokenPayload {
  const admin = getAdminFromEvent(event)
  if (!admin) {
    throw createError({
      statusCode: 401,
      statusMessage: 'กรุณาเข้าสู่ระบบผู้ดูแลระบบ (/office/login) ก่อนดำเนินการ'
    })
  }
  return admin
}
