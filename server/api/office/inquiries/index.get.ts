import { requireAdmin } from '../../../utils/auth'
import { dbQuery } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const rows = await dbQuery<Record<string, any>>('SELECT * FROM inquiries ORDER BY id DESC')
  const inquiries = rows.map((row) => {
    let attachments: any[] = []
    if (row.attachments_json) {
      try {
        attachments = JSON.parse(row.attachments_json)
      } catch {
        attachments = []
      }
    }
    return {
      ...row,
      attachments
    }
  })
  return { inquiries }
})
