import fs from 'node:fs'
import { createError, getRouterParam } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { dbExecute, dbQueryOne } from '../../../utils/db'
import { resolveLocalUploadDiskPath } from '../../../utils/media'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const row = await dbQueryOne<{ attachments_json: string | null }>(
    'SELECT attachments_json FROM inquiries WHERE id = ?',
    [id]
  )
  if (row?.attachments_json) {
    try {
      const list = JSON.parse(row.attachments_json)
      if (Array.isArray(list)) {
        for (const att of list) {
          if (att?.url && String(att.url).startsWith('/uploads/inquiries/')) {
            const diskPath = resolveLocalUploadDiskPath(att.url)
            if (diskPath && fs.existsSync(diskPath)) {
              fs.unlinkSync(diskPath)
            }
          }
        }
      }
    } catch {
      // Ignore parse/cleanup errors
    }
  }

  await dbExecute('DELETE FROM inquiries WHERE id = ?', [id])
  return { ok: true }
})
