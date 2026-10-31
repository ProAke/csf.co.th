import { createError, getRouterParam } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { dbExecute, dbQueryOne } from '../../../utils/db'

export default defineEventHandler(async event => {
  requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const inUse = await dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM products WHERE category_id = ?', [id])
  if (Number(inUse?.cnt || 0) > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ไม่สามารถลบหมวดหมู่ที่ยังมีสินค้าผูกอยู่ได้ กรุณาย้ายหมวดหมู่สินค้าก่อน'
    })
  }
  await dbExecute('DELETE FROM categories WHERE id = ?', [id])
  return { ok: true }
})
