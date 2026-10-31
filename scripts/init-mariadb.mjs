import fs from 'node:fs'
import path from 'node:path'
import mysql from 'mysql2/promise'

async function main() {
  const host = process.env.DB_HOST || '127.0.0.1'
  const port = Number(process.env.DB_PORT || 3306)
  const user = process.env.DB_USER || 'csf_user'
  const password = process.env.DB_PASSWORD || 'csf_password_2026'
  const database = process.env.DB_NAME || 'csf_db'

  console.log(`[CSF MariaDB Init] Connecting to ${host}:${port} ...`)
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true
  })

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`)
  await conn.query(`USE \`${database}\`;`)

  const schemaSql = fs.readFileSync(path.resolve(process.cwd(), 'database/schema.sql'), 'utf8')
  await conn.query(schemaSql)
  await conn.end()
  console.log(`[CSF MariaDB Init] Schema applied successfully to \`${database}\`. Start Nuxt to auto-seed initial CSF catalog!`)
}

main().catch(err => {
  console.error('[CSF MariaDB Init] Failed:', err.message)
  process.exit(1)
})
