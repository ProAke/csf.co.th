import { setResponseHeader } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { exportMariaDbSqlDump } from '../../../utils/db'

export default defineEventHandler(async event => {
  requireAdmin(event)
  const sql = await exportMariaDbSqlDump()
  setResponseHeader(event, 'Content-Type', 'application/sql; charset=utf-8')
  setResponseHeader(event, 'Content-Disposition', 'attachment; filename="csf_co_th_mariadb_dump.sql"')
  return sql
})
