import { createError, getRouterParam, readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { dbExecute } from '../../../utils/db'
import { localizeExternalAssetUrl, localizeHtmlAssets } from '../../../utils/media'

export default defineEventHandler(async event => {
  requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })

  const body = await readBody(event)
  const sku = String(body?.sku || '').trim()
  const name = String(body?.name || '').trim()
  if (!sku || !name) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุรหัสสินค้า (SKU) และชื่อสินค้า' })
  }

  const slug = String(body?.slug || '').trim() || sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const subtitle = String(body?.subtitle || '').trim()
  const brand = String(body?.brand || 'CSF Partner Brand').trim()
  const category_id = Number(body?.category_id || 1)
  const description = await localizeHtmlAssets(String(body?.description || '').trim(), 'products')
  const specs = Array.isArray(body?.specs)
    ? body.specs.map((s: any) => String(s).trim()).filter(Boolean)
    : String(body?.specs_text || '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
  const price_display = String(body?.price_display || 'ขอใบเสนอราคา (B2B)').trim()
  const price_amount = body?.price_amount !== '' && body?.price_amount !== null && body?.price_amount !== undefined ? Number(body.price_amount) : null
  const localizedImg = await localizeExternalAssetUrl(String(body?.image_url || '/images/prod-speaker.jpg').trim(), { folder: 'products' })
  const localizedPdf = await localizeExternalAssetUrl(String(body?.datasheet_url || '').trim(), { folder: 'products' })
  const image_url = localizedImg.localUrl
  const datasheet_url = localizedPdf.localUrl
  const stock_status = String(body?.stock_status || 'มีสินค้าพร้อมส่ง').trim()
  const is_featured = body?.is_featured ? 1 : 0
  const is_active = body?.is_active !== false && body?.is_active !== 0 ? 1 : 0

  await dbExecute(
    `UPDATE products
     SET sku = ?, slug = ?, name = ?, subtitle = ?, brand = ?, category_id = ?, description = ?, specs_json = ?, price_display = ?, price_amount = ?, image_url = ?, datasheet_url = ?, stock_status = ?, is_featured = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      sku,
      slug,
      name,
      subtitle,
      brand,
      category_id,
      description,
      JSON.stringify(specs),
      price_display,
      price_amount,
      image_url,
      datasheet_url,
      stock_status,
      is_featured,
      is_active,
      id
    ]
  )

  return { ok: true, image_url }
})
