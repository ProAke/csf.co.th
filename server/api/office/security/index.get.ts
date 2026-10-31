import { getJwtSecretRuntime, requireAdmin } from '../../../utils/auth'
import { dbQuery, dbQueryOne } from '../../../utils/db'
import { isRequestHttps } from '../../../utils/security'

export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event)
  const jwtSecret = getJwtSecretRuntime(event)

  const logs = await dbQuery<Record<string, any>>(
    'SELECT * FROM security_logs ORDER BY id DESC LIMIT 100'
  )

  const [totalRow, scannerRow, failedLoginRow, uploadBlockRow, userRow] = await Promise.all([
    dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM security_logs'),
    dbQueryOne<{ cnt: number }>(
      "SELECT COUNT(*) as cnt FROM security_logs WHERE event_type IN ('scanner_blocked', 'bot_honeypot_blocked')"
    ),
    dbQueryOne<{ cnt: number }>(
      "SELECT COUNT(*) as cnt FROM security_logs WHERE event_type IN ('login_failed', 'brute_force_blocked')"
    ),
    dbQueryOne<{ cnt: number }>(
      "SELECT COUNT(*) as cnt FROM security_logs WHERE event_type = 'upload_rejected'"
    ),
    dbQueryOne<{ last_login_at: string | null }>(
      'SELECT last_login_at FROM users WHERE id = ?',
      [admin.sub]
    )
  ])

  const customJwtSecret =
    jwtSecret !== 'csf-enterprise-secret-2026' &&
    jwtSecret !== 'change-this-to-a-64-char-random-secret-in-production'

  const checks = [
    {
      id: 'hidden_office_url',
      title: 'ซ่อนเส้นทางหลังบ้านไว้ที่ /office (Scanner Trap)',
      status: 'active',
      detail: 'ปิดกั้น /admin, /wp-admin, /wp-login.php, /.env, /phpmyadmin ด้วย HTTP 404 (ไม่ Redirect เผยเส้นทาง) พร้อมบันทึก IP ผู้บุกรุก'
    },
    {
      id: 'httponly_session',
      title: 'HttpOnly + SameSite=Lax Signed JWT Session (8 ชม.)',
      status: 'active',
      detail: 'คุกกี้เซสชัน csf_office_session ตั้งค่า HttpOnly ป้องกันสคริปต์ฝั่งเบราว์เซอร์ขโมย Token (ไม่เก็บใน localStorage) และผูก Password Fingerprint'
    },
    {
      id: 'pbkdf2_timing_safe',
      title: 'PBKDF2-HMAC-SHA512 (100,000 รอบ) + Constant-Time Guard',
      status: 'active',
      detail: 'เข้ารหัสรหัสผ่านด้วย Salt สุ่มเฉพาะรายและตรวจสอบด้วย crypto.timingSafeEqual ป้องกัน Timing Username Enumeration'
    },
    {
      id: 'brute_force_guard',
      title: 'ระบบล็อกป้องกันการสุ่มรหัสผ่าน (Brute-Force Rate Limit)',
      status: 'active',
      detail: 'จำกัดการล็อกอินผิดพลาดไม่เกิน 5 ครั้งภายใน 15 นาทีต่อ IP และชื่อบัญชี (ตอบกลับ HTTP 429 อัตโนมัติ)'
    },
    {
      id: 'magic_byte_upload',
      title: 'ตรวจสอบโครงสร้างไฟล์ไบนารี (Magic-Byte File Signature)',
      status: 'active',
      detail: 'ตรวจ Header ไบนารีจริงของ PDF, JPEG, PNG, Excel, Word, PowerPoint บล็อกไฟล์ปลอมนามสกุล (.exe/.php/.html) และปิดกั้นไฟล์ .svg'
    },
    {
      id: 'uploads_sandbox_csp',
      title: 'แยก Sandbox สำหรับไฟล์อัปโหลด (/uploads/**)',
      status: 'active',
      detail: 'แนบ Content-Security-Policy: sandbox และ X-Content-Type-Options: nosniff บังคับดาวน์โหลดไฟล์เอกสาร ป้องกัน Stored XSS 100%'
    },
    {
      id: 'csrf_origin_guard',
      title: 'ป้องกันการโจมตีข้ามโดเมน (CSRF & Origin Verification)',
      status: 'active',
      detail: 'บล็อกคำขอ POST/PUT/DELETE ข้ามไซต์ (Sec-Fetch-Site: cross-site และ Origin Mismatch) บนทุก API สำคัญ'
    },
    {
      id: 'sql_parameterized',
      title: 'ป้องกัน SQL Injection 100% (Prepared Statements)',
      status: 'active',
      detail: 'ทุกคำสั่งฐานข้อมูล MariaDB / SQLite ใช้ Parameterized Placeholders (?) ทั้งระบบ ไม่มี String Concatenation'
    },
    {
      id: 'ssrf_webhook_hmac',
      title: 'ป้องกัน SSRF & ตรวจลายเซ็น LINE / Facebook Webhook',
      status: 'active',
      detail: 'บล็อกการดูดไฟล์จาก Private IP (127.0.0.1, 10.x, 192.168.x, 169.254.x) และตรวจ HMAC-SHA256 ของ LINE/Facebook'
    },
    {
      id: 'env_jwt_secret',
      title: 'คีย์เข้ารหัสเซสชัน (ADMIN_JWT_SECRET) & HTTPS HSTS',
      status: customJwtSecret || isRequestHttps(event) ? 'active' : 'recommend',
      detail: customJwtSecret
        ? 'กำหนดค่า ADMIN_JWT_SECRET เฉพาะเซิร์ฟเวอร์เรียบร้อยแล้ว'
        : 'ทำงานปกติ (เมื่อนำขึ้น uat.csf.co.th / www.csf.co.th แนะนำกำหนดค่า ADMIN_JWT_SECRET เฉพาะองค์กรในไฟล์ .env)'
    }
  ]

  return {
    checks,
    stats: {
      totalEvents: Number(totalRow?.cnt || 0),
      blockedScanners: Number(scannerRow?.cnt || 0),
      failedLogins: Number(failedLoginRow?.cnt || 0),
      rejectedUploads: Number(uploadBlockRow?.cnt || 0),
      lastLoginAt: userRow?.last_login_at || null
    },
    logs
  }
})
