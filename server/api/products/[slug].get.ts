import { createError, getRouterParam } from 'h3'
import { dbExecute, dbQuery, dbQueryOne } from '../../utils/db'

export default defineEventHandler(async event => {
  const slug = getRouterParam(event, 'slug') || ''
  const product = await dbQueryOne<any>(
    `SELECT p.*, c.slug as category_slug, c.name_th as category_name_th, c.name_en as category_name_en
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.slug = ? AND p.is_active = 1`,
    [slug]
  )

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบข้อมูลสินค้าที่ต้องการ' })
  }

  await dbExecute('UPDATE products SET views_count = views_count + 1 WHERE id = ?', [product.id])

  const related = await dbQuery<any>(
    `SELECT p.*, c.slug as category_slug, c.name_th as category_name_th, c.name_en as category_name_en
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1
     ORDER BY p.is_featured DESC, p.id ASC
     LIMIT 3`,
    [product.category_id, product.id]
  )

  let specs: string[] = []
  try {
    specs = JSON.parse(product.specs_json || '[]')
  } catch {
    specs = []
  }

  return {
    product: {
      ...product,
      views_count: Number(product.views_count || 0) + 1,
      specs
    },
    related
  }
})
