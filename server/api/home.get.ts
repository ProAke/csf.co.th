import { dbQuery } from '../utils/db'

export default defineEventHandler(async () => {
  const [banners, categories, featuredProducts, latestArticles] = await Promise.all([
    dbQuery('SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'),
    dbQuery(
      `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) as product_count
       FROM categories c
       WHERE c.is_active = 1
       ORDER BY c.sort_order ASC, c.id ASC`
    ),
    dbQuery<any>(
      `SELECT p.*, c.slug as category_slug, c.name_th as category_name_th, c.name_en as category_name_en
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.is_active = 1 AND p.is_featured = 1
       ORDER BY p.id ASC
       LIMIT 8`
    ),
    dbQuery(
      `SELECT id, slug, title, excerpt, category, cover_image, author_name, published_at, views_count
       FROM articles
       WHERE is_published = 1
       ORDER BY published_at DESC, id DESC
       LIMIT 3`
    )
  ])

  const parsedProducts = featuredProducts.map(p => ({
    ...p,
    specs: safeParseArray(p.specs_json)
  }))

  return {
    banners,
    categories,
    featuredProducts: parsedProducts,
    latestArticles
  }
})

function safeParseArray(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
