import fs from 'node:fs'
import { requireAdmin } from '../../../utils/auth'
import { resolveLocalUploadDiskPath } from '../../../utils/media'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody<{ url?: string }>(event)
  const relUrl = String(body?.url || '').trim()

  const diskPath = resolveLocalUploadDiskPath(relUrl)
  if (!diskPath || !fs.existsSync(diskPath)) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบไฟล์ที่ต้องการลบ' })
  }

  fs.unlinkSync(diskPath)
  return { ok: true }
})
