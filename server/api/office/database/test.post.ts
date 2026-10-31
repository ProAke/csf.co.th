import { readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { getDbStatus, testMariaDbConnection } from '../../../utils/db'
import { getMariaDbRuntimeParams } from '../../../utils/env'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody(event)
  const runtimeDb = getMariaDbRuntimeParams(useRuntimeConfig(event) as any)

  if (!body?.host && !body?.useEnv) {
    const status = await getDbStatus()
    return {
      ok: true,
      status,
      configured: {
        host: runtimeDb.host,
        port: runtimeDb.port,
        user: runtimeDb.user,
        database: runtimeDb.database,
        hasPassword: Boolean(runtimeDb.password)
      }
    }
  }

  const target = body?.useEnv
    ? runtimeDb
    : {
        host: String(body.host || runtimeDb.host).trim(),
        port: Number(body.port || runtimeDb.port || 3360),
        user: String(body.user || runtimeDb.user).trim(),
        password: body.password ? String(body.password) : runtimeDb.password,
        database: String(body.database || runtimeDb.database).trim()
      }

  try {
    const res = await testMariaDbConnection(target)
    return {
      ok: true,
      message: `เชื่อมต่อเซิร์ฟเวอร์ MariaDB (${target.host}:${target.port}/${target.database}) สำเร็จ! เวอร์ชัน: ${res.version}`
    }
  } catch (err: any) {
    return {
      ok: false,
      message: `ไม่สามารถเชื่อมต่อไปยัง ${target.host}:${target.port}/${target.database} ได้ (${err?.code || err?.message || 'Connection failed'})`
    }
  }
})
