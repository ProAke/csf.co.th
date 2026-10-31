import { requireAdmin } from '../../../utils/auth'
import { dbQuery } from '../../../utils/db'

export default defineEventHandler(async event => {
  requireAdmin(event)
  const [integrations, logs, products] = await Promise.all([
    dbQuery('SELECT * FROM social_integrations ORDER BY id ASC'),
    dbQuery('SELECT * FROM social_logs ORDER BY id DESC LIMIT 25'),
    dbQuery('SELECT id, sku, slug, name, subtitle, brand, price_display, stock_status FROM products WHERE is_active = 1 ORDER BY is_featured DESC, id ASC')
  ])
  return { integrations, logs, products }
})
