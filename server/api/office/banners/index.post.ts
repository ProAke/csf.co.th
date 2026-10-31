import { createError, readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { dbExecute } from '../../../utils/db'
import { localizeExternalAssetUrl } from '../../../utils/media'

export default defineEventHandler(async event => {
  requireAdmin(event)
  const body = await readBody(event)
  const title = String(body?.title || '').trim()
  if (!title) throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุหัวข้อแบนเนอร์' })

  const localized = await localizeExternalAssetUrl(String(body?.image_url || '/images/hero-it.jpg').trim(), { folder: 'banners' })

  const res = await dbExecute(
    `INSERT INTO banners (badge, title, subtitle, description, cta_label, cta_link, secondary_label, secondary_link, image_url, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      String(body?.badge || 'CSF TECHNOLOGY TOUCH').trim(),
      title,
      String(body?.subtitle || '').trim(),
      String(body?.description || '').trim(),
      String(body?.cta_label || 'ดูสินค้า').trim(),
      String(body?.cta_link || '/products').trim(),
      String(body?.secondary_label || 'ขอใบเสนอราคา').trim(),
      String(body?.secondary_link || '/contact').trim(),
      localized.localUrl,
      Number(body?.sort_order || 1),
      body?.is_active !== false && body?.is_active !== 0 ? 1 : 0
    ]
  )
  return { ok: true, id: res.insertId, image_url: localized.localUrl }
})
