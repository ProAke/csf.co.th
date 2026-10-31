import { createError, getRouterParam } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { dbExecute } from '../../../utils/db'

export default defineEventHandler(async event => {
  requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  await dbExecute('DELETE FROM articles WHERE id = ?', [id])
  return { ok: true }
})
