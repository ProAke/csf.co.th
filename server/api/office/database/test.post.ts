import { readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { getDbStatus, testMariaDbConnection } from '../../../utils/db'

export default defineEventHandler(async event => {
  requireAdmin(event)
  const body = await readBody(event)

  if (!body?.host) {
    const status = await getDbStatus()
    return { ok: true, status }
  }

  try {
    const res = await testMariaDbConnection({
      host: String(body.host).trim(),
      port: Number(body.port || 3306),
      user: String(body.user || 'csf_user').trim(),
      password: String(body.password || ''),
      database: String(body.database || 'csf_db').trim()
    })
    return {
      ok: true,
      message: `เชื่อมต่อเซิร์ฟเวอร์ MariaDB สำเร็จ! เวอร์ชัน: ${res.version}`
    }
  } catch (err: any) {
    return {
      ok: false,
      message: `ไม่สามารถเชื่อมต่อไปยัง ${body.host}:${body.port || 3306} ได้ (${err?.code || err?.message || 'Connection failed'})`
    }
  }
})
