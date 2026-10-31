import { requireAdmin } from '../../../utils/auth'
import { dbQuery } from '../../../utils/db'

export default defineEventHandler(async event => {
  requireAdmin(event)
  const categories = await dbQuery(
    `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
     FROM categories c
     ORDER BY c.sort_order ASC, c.id ASC`
  )
  return { categories }
})
