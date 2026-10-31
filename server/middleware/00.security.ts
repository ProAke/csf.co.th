import { createError, getHeader, setHeader } from 'h3'
import { isRequestHttps, logSecurityEvent } from '../utils/security'

const SCANNER_TRAP_PREFIXES = [
  '/admin',
  '/api/admin',
  '/wp-admin',
  '/wp-login.php',
  '/xmlrpc.php',
  '/.env',
  '/.git',
  '/phpmyadmin',
  '/pma',
  '/vendor/phpunit'
]

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export default defineEventHandler(async (event) => {
  const reqPath = (event.path || '/').split('?')[0]
  const lowerPath = reqPath.toLowerCase()
  const method = (event.method || 'GET').toUpperCase()

  // 1. Standard Hardening Headers (Preview-safe: frame-ancestors enforced only in production)
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')
  setHeader(event, 'Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  setHeader(event, 'X-Permitted-Cross-Domain-Policies', 'none')

  if (isRequestHttps(event)) {
    setHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  if (process.env.NODE_ENV === 'production') {
    setHeader(event, 'X-Frame-Options', 'SAMEORIGIN')
  }

  if (lowerPath.startsWith('/uploads/')) {
    setHeader(
      event,
      'Content-Security-Policy',
      "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox"
    )
  }

  // Prevent search engine indexing of /office and /api routes via HTTP header
  if (lowerPath === '/office' || lowerPath.startsWith('/office/') || lowerPath.startsWith('/api/')) {
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow, noarchive')
  }

  // 2. Scanner & Legacy Admin URL Trap (/admin, /wp-admin, /.env -> 404 Not Found, zero redirect leak!)
  const matchedTrap = SCANNER_TRAP_PREFIXES.find(
    prefix => lowerPath === prefix || lowerPath.startsWith(`${prefix}/`)
  )
  if (matchedTrap) {
    await logSecurityEvent({
      event,
      eventType: 'scanner_blocked',
      severity: 'warn',
      targetPath: reqPath,
      detail: `บล็อกการเข้าถึงเส้นทางต้องห้าม (${matchedTrap}) เพื่อซ่อนระบบหลังบ้าน /office`
    })
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found'
    })
  }

  // 3. CSRF / Cross-Site Request Forgery Guard on state-changing API endpoints (excluding signed webhooks)
  if (
    STATE_CHANGING_METHODS.has(method) &&
    lowerPath.startsWith('/api/') &&
    !lowerPath.startsWith('/api/webhooks/')
  ) {
    const secFetchSite = String(getHeader(event, 'sec-fetch-site') || '').toLowerCase()
    const origin = getHeader(event, 'origin')
    const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host') || ''

    if (secFetchSite === 'cross-site') {
      await logSecurityEvent({
        event,
        eventType: 'csrf_blocked',
        severity: 'critical',
        targetPath: reqPath,
        detail: `บล็อกคำขอข้ามโดเมน (Sec-Fetch-Site: cross-site, Origin: ${origin || 'unknown'})`
      })
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: Cross-site request blocked by CSRF guard'
      })
    }

    if (origin && host) {
      try {
        const originHost = new URL(origin).host.toLowerCase()
        const targetHost = host.split(',')[0].trim().toLowerCase()
        if (originHost && targetHost && originHost !== targetHost) {
          await logSecurityEvent({
            event,
            eventType: 'csrf_blocked',
            severity: 'critical',
            targetPath: reqPath,
            detail: `บล็อก Origin ไม่ตรงกับโดเมนหลัก (${originHost} != ${targetHost})`
          })
          throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden: Origin mismatch'
          })
        }
      } catch (e: any) {
        if (e?.statusCode === 403) throw e
      }
    }
  }
})
