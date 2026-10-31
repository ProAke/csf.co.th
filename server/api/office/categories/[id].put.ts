import { createError, getRouterParam, readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { dbExecute } from '../../../utils/db'
import { localizeExternalAssetUrl } from '../../../utils/media'

export default defineEventHandler(async event => {
  requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  const body = await readBody(event)

  const localized = await localizeExternalAssetUrl(String(body?.image_url || '').trim(), { folder: 'banners' })

  await dbExecute(
    `UPDATE categories SET slug = ?, name_th = ?, name_en = ?, description = ?, icon = ?, image_url = ?, sort_order = ?, is_active = ?
     WHERE id = ?`,
    [
      String(body?.slug || '').trim(),
      String(body?.name_th || '').trim(),
      String(body?.name_en || '').trim(),
      String(body?.description || '').trim(),
      String(body?.icon || 'Cpu').trim(),
      localized.localUrl,
      Number(body?.sort_order || 0),
      body?.is_active !== false && body?.is_active !== 0 ? 1 : 0,
      id
    ]
  )
  return { ok: true, image_url: localized.localUrl }
})
