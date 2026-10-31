import { requireAdmin } from '../../../utils/auth'
import { dbQuery } from '../../../utils/db'

export default defineEventHandler(async event => {
  requireAdmin(event)
  const banners = await dbQuery('SELECT * FROM banners ORDER BY sort_order ASC, id ASC')
  return { banners }
})
