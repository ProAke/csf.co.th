import { createError, getRouterParam } from 'h3'
import { dbExecute, dbQuery, dbQueryOne } from '../../utils/db'

export default defineEventHandler(async event => {
  const slug = getRouterParam(event, 'slug') || ''
  const article = await dbQueryOne<any>('SELECT * FROM articles WHERE slug = ? AND is_published = 1', [slug])

  if (!article) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบบทความที่ต้องการ' })
  }

  await dbExecute('UPDATE articles SET views_count = views_count + 1 WHERE id = ?', [article.id])

  const related = await dbQuery(
    `SELECT id, slug, title, excerpt, category, cover_image, author_name, published_at
     FROM articles
     WHERE id != ? AND is_published = 1
     ORDER BY published_at DESC
     LIMIT 3`,
    [article.id]
  )

  return {
    article: {
      ...article,
      views_count: Number(article.views_count || 0) + 1
    },
    related
  }
})
