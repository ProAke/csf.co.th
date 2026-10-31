import { createError, getRouterParam, readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { dbExecute } from '../../../utils/db'
import { localizeExternalAssetUrl } from '../../../utils/media'

export default defineEventHandler(async event => {
  requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readBody(event)

  const localized = await localizeExternalAssetUrl(String(body?.image_url || '/images/hero-it.jpg').trim(), { folder: 'banners' })

  await dbExecute(
    `UPDATE banners SET badge = ?, title = ?, subtitle = ?, description = ?, cta_label = ?, cta_link = ?, secondary_label = ?, secondary_link = ?, image_url = ?, sort_order = ?, is_active = ?
     WHERE id = ?`,
    [
      String(body?.badge || '').trim(),
      String(body?.title || '').trim(),
      String(body?.subtitle || '').trim(),
      String(body?.description || '').trim(),
      String(body?.cta_label || 'ดูสินค้า').trim(),
      String(body?.cta_link || '/products').trim(),
      String(body?.secondary_label || 'ขอใบเสนอราคา').trim(),
      String(body?.secondary_link || '/contact').trim(),
      localized.localUrl,
      Number(body?.sort_order || 1),
      body?.is_active !== false && body?.is_active !== 0 ? 1 : 0,
      id
    ]
  )
  return { ok: true, image_url: localized.localUrl }
})
