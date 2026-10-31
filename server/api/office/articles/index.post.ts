import { createError, readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { dbExecute } from '../../../utils/db'
import { localizeExternalAssetUrl, localizeHtmlAssets } from '../../../utils/media'
import { sanitizeRichHtml } from '../../../utils/security'

export default defineEventHandler(async event => {
  requireAdmin(event)
  const body = await readBody(event)
  const title = String(body?.title || '').trim()
  const rawContent = sanitizeRichHtml(String(body?.content || '').trim())
  if (!title || !rawContent) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุหัวข้อบทความและเนื้อหา' })
  }

  const content = await localizeHtmlAssets(rawContent, 'articles')
  const localizedCover = await localizeExternalAssetUrl(
    String(body?.cover_image || '/uploads/articles/classroom-support.jpg').trim(),
    { folder: 'articles' }
  )

  const slug =
    String(body?.slug || '').trim() ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙]+/g, '-')
      .replace(/^-+|-+$/g, '') ||
    `article-${Date.now()}`

  const res = await dbExecute(
    `INSERT INTO articles (slug, title, excerpt, content, category, cover_image, author_name, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      slug,
      title,
      String(body?.excerpt || content.slice(0, 180)).trim(),
      content,
      String(body?.category || 'Product Support').trim(),
      localizedCover.localUrl,
      String(body?.author_name || 'ทีมวิศวกร CSF Technology Touch').trim(),
      body?.is_published !== false && body?.is_published !== 0 ? 1 : 0
    ]
  )
  return { ok: true, id: res.insertId, slug, cover_image: localizedCover.localUrl }
})
