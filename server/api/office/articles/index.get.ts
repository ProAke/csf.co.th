import { requireAdmin } from '../../../utils/auth'
import { dbQuery } from '../../../utils/db'

export default defineEventHandler(async event => {
  requireAdmin(event)
  const articles = await dbQuery('SELECT * FROM articles ORDER BY id DESC')
  return { articles }
})
