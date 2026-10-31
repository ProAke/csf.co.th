import { getQuery } from 'h3'
import { dbQuery } from '../../utils/db'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const category = String(query.category || '').trim()
  const q = String(query.q || '').trim()
  const featured = String(query.featured || '').trim()

  const conditions: string[] = ['p.is_active = 1']
  const params: any[] = []

  if (category && category !== 'all') {
    if (/^\d+$/.test(category)) {
      conditions.push('p.category_id = ?')
      params.push(Number(category))
    } else {
      conditions.push('c.slug = ?')
      params.push(category)
    }
  }

  if (featured === '1' || featured === 'true') {
    conditions.push('p.is_featured = 1')
  }

  if (q) {
    conditions.push('(p.sku LIKE ? OR p.name LIKE ? OR p.subtitle LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)')
    const like = `%${q}%`
    params.push(like, like, like, like, like)
  }

  const sql = `
    SELECT p.*, c.slug as category_slug, c.name_th as category_name_th, c.name_en as category_name_en
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY p.is_featured DESC, p.id ASC
  `
  const rows = await dbQuery<any>(sql, params)
  const categories = await dbQuery(
    `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) as product_count
     FROM categories c
     WHERE c.is_active = 1
     ORDER BY c.sort_order ASC`
  )

  return {
    products: rows.map(r => ({
      ...r,
      specs: safeParseJsonArray(r.specs_json)
    })),
    categories
  }
})

function safeParseJsonArray(val: string | null): string[] {
  if (!val) return []
  try {
    const arr = JSON.parse(val)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}
