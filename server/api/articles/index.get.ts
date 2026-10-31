import { getQuery } from 'h3'
import { dbQuery } from '../../utils/db'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const category = String(query.category || '').trim()
  const q = String(query.q || '').trim()

  const conditions: string[] = ['is_published = 1']
  const params: any[] = []

  if (category && category !== 'all') {
    conditions.push('category = ?')
    params.push(category)
  }

  if (q) {
    conditions.push('(title LIKE ? OR excerpt LIKE ? OR content LIKE ?)')
    const like = `%${q}%`
    params.push(like, like, like)
  }

  const articles = await dbQuery(
    `SELECT id, slug, title, excerpt, category, cover_image, author_name, published_at, views_count
     FROM articles
     WHERE ${conditions.join(' AND ')}
     ORDER BY published_at DESC, id DESC`,
    params
  )

  return { articles }
})
