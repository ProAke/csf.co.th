import { createError, readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { dbQueryOne } from '../../../utils/db'
import { buildLineProductFlexMessage, publishToSocialChannel } from '../../../utils/social'

export default defineEventHandler(async event => {
  requireAdmin(event)
  const config = useRuntimeConfig(event)
  const body = await readBody(event)

  const platform = body?.platform === 'facebook' ? 'facebook' : 'line_oa'
  const productId = body?.product_id ? Number(body.product_id) : null
  let message = String(body?.message || '').trim()
  let linkUrl = String(body?.link_url || '').trim()
  let flexMessage: any = undefined

  if (productId) {
    const prod = await dbQueryOne<any>('SELECT * FROM products WHERE id = ?', [productId])
    if (prod) {
      const siteUrl = config.public.siteUrl || 'https://uat.csf.co.th'
      linkUrl = `${siteUrl}/products/${prod.slug}`
      if (!message) {
        message = `แนะนำสินค้าเด่นจาก CSF Technology Touch:\n[${prod.sku}] ${prod.name}\n${prod.subtitle}\nราคา: ${prod.price_display}\nดูรายละเอียด: ${linkUrl}`
      }
      if (platform === 'line_oa') {
        flexMessage = buildLineProductFlexMessage({
          sku: prod.sku,
          slug: prod.slug,
          name: prod.name,
          subtitle: prod.subtitle,
          brand: prod.brand,
          price_display: prod.price_display,
          stock_status: prod.stock_status,
          siteUrl
        })
      }
    }
  }

  if (!message && !flexMessage) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุข้อความหรือเลือกสินค้าที่ต้องการประชาสัมพันธ์' })
  }

  const result = await publishToSocialChannel({
    platform,
    message: message || 'อัปเดตสินค้าและบริการจาก CSF Technology Touch',
    linkUrl,
    flexMessage
  })

  return result
})
