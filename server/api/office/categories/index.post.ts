import { createError, readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { dbExecute } from '../../../utils/db'
import { localizeExternalAssetUrl } from '../../../utils/media'

export default defineEventHandler(async event => {
  requireAdmin(event)
  const body = await readBody(event)
  const name_th = String(body?.name_th || '').trim()
  const name_en = String(body?.name_en || name_th).trim()
  if (!name_th) throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุชื่อหมวดหมู่ภาษาไทย' })

  const slug =
    String(body?.slug || '').trim() ||
    name_en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') ||
    `cat-${Date.now()}`

  const localized = await localizeExternalAssetUrl(String(body?.image_url || '/images/hero-it.jpg').trim(), { folder: 'banners' })

  const res = await dbExecute(
    `INSERT INTO categories (slug, name_th, name_en, description, icon, image_url, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      slug,
      name_th,
      name_en,
      String(body?.description || '').trim(),
      String(body?.icon || 'Cpu').trim(),
      localized.localUrl,
      Number(body?.sort_order || 0),
      body?.is_active !== false && body?.is_active !== 0 ? 1 : 0
    ]
  )
  return { ok: true, id: res.insertId, image_url: localized.localUrl }
})
