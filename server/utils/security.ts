import crypto from 'node:crypto'
import type { H3Event } from 'h3'
import { getHeader } from 'h3'
import { dbExecute } from './db'

interface RateBucketEntry {
  timestamps: number[]
}

const rateBuckets = new Map<string, RateBucketEntry>()

function cleanupBuckets(now: number, maxWindowMs: number) {
  if (rateBuckets.size < 2000) return
  for (const [k, v] of rateBuckets.entries()) {
    v.timestamps = v.timestamps.filter(t => now - t < maxWindowMs)
    if (v.timestamps.length === 0) rateBuckets.delete(k)
  }
}

export function checkRateLimit(
  bucket: string,
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now()
  cleanupBuckets(now, Math.max(windowMs, 15 * 60 * 1000))

  const key = `${bucket}:${identifier}`
  const entry = rateBuckets.get(key) || { timestamps: [] }
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs)

  if (entry.timestamps.length >= maxRequests) {
    const oldest = entry.timestamps[0] || now
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000))
    rateBuckets.set(key, entry)
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec
    }
  }

  entry.timestamps.push(now)
  rateBuckets.set(key, entry)
  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - entry.timestamps.length),
    retryAfterSec: 0
  }
}

export function resetRateLimit(bucket: string, identifier: string) {
  rateBuckets.delete(`${bucket}:${identifier}`)
}

export function getClientIp(event: H3Event): string {
  const cfIp = getHeader(event, 'cf-connecting-ip')
  if (cfIp) return cfIp.trim().slice(0, 64)

  const xff = getHeader(event, 'x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return first.slice(0, 64)
  }

  const realIp = getHeader(event, 'x-real-ip')
  if (realIp) return realIp.trim().slice(0, 64)

  return (event.node.req.socket?.remoteAddress || '127.0.0.1').slice(0, 64)
}

export function getUserAgent(event: H3Event): string {
  return String(getHeader(event, 'user-agent') || '').slice(0, 240)
}

export function isRequestHttps(event: H3Event): boolean {
  const proto = String(getHeader(event, 'x-forwarded-proto') || '').toLowerCase()
  if (proto.includes('https')) return true
  const encrypted = (event.node.req.socket as any)?.encrypted
  return Boolean(encrypted)
}

export async function logSecurityEvent(params: {
  event?: H3Event
  eventType: string
  severity?: 'info' | 'warn' | 'critical'
  actor?: string
  targetPath?: string
  detail: string
}) {
  try {
    const ip = params.event ? getClientIp(params.event) : ''
    const ua = params.event ? getUserAgent(params.event) : ''
    const pathStr = params.targetPath || (params.event ? params.event.path || '' : '')
    await dbExecute(
      `INSERT INTO security_logs (event_type, severity, ip_address, actor, target_path, user_agent, detail)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        params.eventType.slice(0, 60),
        params.severity || 'info',
        ip,
        (params.actor || '').slice(0, 120),
        pathStr.slice(0, 250),
        ua,
        params.detail.slice(0, 1000)
      ]
    )
  } catch {
    // Never let logging errors break request processing
  }
}

/**
 * Validates binary magic-byte signatures so attackers cannot disguise
 * HTML/PHP/JS/EXE payloads with document or image extensions.
 */
export function validateFileSignature(
  buffer: Buffer,
  extWithDot: string
): { valid: boolean; reason?: string } {
  const ext = extWithDot.toLowerCase()
  if (!buffer || buffer.length < 4) {
    return { valid: false, reason: 'ไฟล์ว่างเปล่าหรือมีขนาดเล็กผิดปกติ' }
  }

  // Block Windows PE (MZ) & Linux ELF executables unconditionally
  if (
    (buffer[0] === 0x4d && buffer[1] === 0x5a) ||
    (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46)
  ) {
    return { valid: false, reason: 'ตรวจพบไฟล์โปรแกรมปฏิบัติการ (Executable) ซึ่งไม่อนุญาตให้อัปโหลด' }
  }

  if (ext === '.png') {
    const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
    const ok = buffer.length >= 8 && sig.every((b, i) => buffer[i] === b)
    return ok ? { valid: true } : { valid: false, reason: 'โครงสร้างไฟล์ไม่ใช่รูปภาพ PNG ที่ถูกต้อง' }
  }

  if (ext === '.jpg' || ext === '.jpeg') {
    const ok = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
    return ok ? { valid: true } : { valid: false, reason: 'โครงสร้างไฟล์ไม่ใช่รูปภาพ JPEG ที่ถูกต้อง' }
  }

  if (ext === '.gif') {
    const head = buffer.subarray(0, 6).toString('ascii')
    const ok = head === 'GIF87a' || head === 'GIF89a'
    return ok ? { valid: true } : { valid: false, reason: 'โครงสร้างไฟล์ไม่ใช่รูปภาพ GIF ที่ถูกต้อง' }
  }

  if (ext === '.webp') {
    const ok =
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    return ok ? { valid: true } : { valid: false, reason: 'โครงสร้างไฟล์ไม่ใช่รูปภาพ WEBP ที่ถูกต้อง' }
  }

  if (ext === '.ico') {
    const ok = buffer[0] === 0x00 && buffer[1] === 0x00 && (buffer[2] === 0x01 || buffer[2] === 0x02) && buffer[3] === 0x00
    return ok ? { valid: true } : { valid: false, reason: 'โครงสร้างไฟล์ไม่ใช่ไอคอน ICO ที่ถูกต้อง' }
  }

  if (ext === '.pdf') {
    const ok = buffer.subarray(0, 5).toString('ascii') === '%PDF-'
    return ok ? { valid: true } : { valid: false, reason: 'โครงสร้างไฟล์ไม่ใช่เอกสาร PDF ที่ถูกต้อง' }
  }

  // Modern Office Open XML (.xlsx, .docx, .pptx) are ZIP containers starting with PK\x03\x04
  if (ext === '.xlsx' || ext === '.docx' || ext === '.pptx') {
    const ok = buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04
    return ok
      ? { valid: true }
      : { valid: false, reason: `โครงสร้างไฟล์ไม่ตรงกับเอกสาร Office (${ext}) มาตรฐาน` }
  }

  // Legacy Microsoft Office Compound File Binary (.xls, .doc, .ppt): D0 CF 11 E0 A1 B1 1A E1
  if (ext === '.xls' || ext === '.doc' || ext === '.ppt') {
    const ole = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]
    const ok = buffer.length >= 8 && ole.every((b, i) => buffer[i] === b)
    return ok
      ? { valid: true }
      : { valid: false, reason: `โครงสร้างไฟล์ไม่ตรงกับเอกสาร Office รุ่นดั้งเดิม (${ext})` }
  }

  if (ext === '.csv') {
    const sample = buffer.subarray(0, Math.min(buffer.length, 4096))
    if (sample.includes(0x00)) {
      return { valid: false, reason: 'ไฟล์ CSV มีข้อมูลไบนารีแปลกปลอม' }
    }
    const text = sample.toString('utf8').toLowerCase()
    if (text.includes('<script') || text.includes('<?php') || text.includes('<!doctype html')) {
      return { valid: false, reason: 'ไม่อนุญาตให้มีสคริปต์หรือโค้ด HTML ในไฟล์ CSV' }
    }
    return { valid: true }
  }

  return { valid: false, reason: `ไม่รองรับนามสกุลไฟล์ ${ext}` }
}

/**
 * Sanitizes rich HTML content stored in CMS articles/products to block XSS vectors.
 */
export function sanitizeRichHtml(input: string): string {
  if (!input) return ''
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*["']\s*(javascript:|vbscript:|data:text\/html)[^"']*["']/gi, '$1="#"')
}

export function createMathChallenge(secret: string) {
  const a = crypto.randomInt(4, 19)
  const b = crypto.randomInt(3, 15)
  const ts = Math.floor(Date.now() / 1000)
  const nonce = crypto.randomBytes(8).toString('hex')
  const answer = a + b
  const data = `${a}:${b}:${ts}:${nonce}:${answer}`
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url')
  const token = Buffer.from(JSON.stringify({ a, b, ts, nonce, sig })).toString('base64url')
  return { a, b, token }
}

export function verifyMathChallenge(token: string, userAnswer: string | number, secret: string): boolean {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'))
    const { a, b, ts, nonce, sig } = decoded
    const now = Math.floor(Date.now() / 1000)
    // Valid for 2 hours
    if (!ts || now - Number(ts) > 7200 || Number(ts) > now + 60) return false
    const answer = Number(userAnswer)
    if (!Number.isFinite(answer) || answer !== Number(a) + Number(b)) return false
    const expectedData = `${a}:${b}:${ts}:${nonce}:${answer}`
    const expectedSig = crypto.createHmac('sha256', secret).update(expectedData).digest('base64url')
    if (typeof sig !== 'string' || sig.length !== expectedSig.length) return false
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))
  } catch {
    return false
  }
}
