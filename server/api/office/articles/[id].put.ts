import { createError, getRouterParam, readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { dbExecute } from '../../../utils/db'
import { localizeExternalAssetUrl, localizeHtmlAssets } from '../../../utils/media'
import { sanitizeRichHtml } from '../../../utils/security'

export default defineEventHandler(async event => {
  requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readBody(event)

  const content = await localizeHtmlAssets(sanitizeRichHtml(String(body?.content || '').trim()), 'articles')
  const localizedCover = await localizeExternalAssetUrl(
    String(body?.cover_image || '/uploads/articles/classroom-support.jpg').trim(),
    { folder: 'articles' }
  )

  await dbExecute(
    `UPDATE articles SET slug = ?, title = ?, excerpt = ?, content = ?, category = ?, cover_image = ?, author_name = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      String(body?.slug || '').trim(),
      String(body?.title || '').trim(),
      String(body?.excerpt || '').trim(),
      content,
      String(body?.category || 'Product Support').trim(),
      localizedCover.localUrl,
      String(body?.author_name || 'ทีมวิศวกร CSF Technology Touch').trim(),
      body?.is_published !== false && body?.is_published !== 0 ? 1 : 0,
      id
    ]
  )
  return { ok: true, cover_image: localizedCover.localUrl }
})
