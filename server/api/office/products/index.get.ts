import { requireAdmin } from '../../../utils/auth'
import { dbQuery } from '../../../utils/db'

export default defineEventHandler(async event => {
  requireAdmin(event)
  const rows = await dbQuery<any>(
    `SELECT p.*, c.name_th as category_name_th, c.slug as category_slug
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ORDER BY p.id DESC`
  )
  return {
    products: rows.map(r => ({
      ...r,
      specs: safeJson(r.specs_json)
    }))
  }
})

function safeJson(v: string | null) {
  if (!v) return []
  try {
    const parsed = JSON.parse(v)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
