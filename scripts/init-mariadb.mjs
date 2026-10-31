import fs from 'node:fs'
import path from 'node:path'
import mysql from 'mysql2/promise'

function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return
  const raw = fs.readFileSync(envPath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx <= 0) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

async function connectSmart({ host, port, user, password, database }) {
  const candidates = [{ host, port }]
  if (host.toLowerCase() === 'localhost') candidates.push({ host: '127.0.0.1', port })
  if ((host.toLowerCase() === 'localhost' || host === '127.0.0.1') && port === 3360) {
    candidates.push({ host: '127.0.0.1', port: 3306 })
  }

  let lastErr = null
  for (const ep of candidates) {
    try {
      // Connect directly to pre-created database (e.g. pacific_csfnuxt) without requiring root CREATE DATABASE
      const conn = await mysql.createConnection({
        host: ep.host,
        port: ep.port,
        user,
        password,
        database,
        multipleStatements: true
      })
      return { conn, ep }
    } catch (err) {
      lastErr = err
      // If database does not exist yet and user has CREATE privilege, create it
      if (err?.code === 'ER_BAD_DB_ERROR') {
        const rootConn = await mysql.createConnection({
          host: ep.host,
          port: ep.port,
          user,
          password,
          multipleStatements: true
        })
        await rootConn.query(
          `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
        )
        await rootConn.query(`USE \`${database}\`;`)
        return { conn: rootConn, ep }
      }
      if (err?.code && err.code !== 'ECONNREFUSED') throw err
    }
  }
  throw lastErr
}

async function main() {
  loadDotEnv()

  const host = process.env.DB_HOST || 'localhost'
  const port = Number(process.env.DB_PORT || 3360)
  const user = process.env.DB_USER || 'pacific_csfnuxt'
  const password = process.env.DB_PASSWORD || ''
  const database = process.env.DB_NAME || 'pacific_csfnuxt'

  console.log(`[CSF MariaDB Init] Connecting to ${host}:${port}/${database} as ${user} ...`)
  const { conn, ep } = await connectSmart({ host, port, user, password, database })
  console.log(`[CSF MariaDB Init] Connected to ${ep.host}:${ep.port}/${database}`)

  const schemaSql = fs.readFileSync(path.resolve(process.cwd(), 'database/schema.sql'), 'utf8')
  await conn.query(schemaSql)

  const [prodRows] = await conn.query('SELECT COUNT(*) as cnt FROM products')
  const count = Number(prodRows?.[0]?.cnt || 0)
  const seedPath = path.resolve(process.cwd(), 'database/seed.sql')

  if (count === 0 && fs.existsSync(seedPath)) {
    console.log('[CSF MariaDB Init] Empty catalog detected — importing initial seed data from database/seed.sql ...')
    const seedSql = fs.readFileSync(seedPath, 'utf8')
    await conn.query(seedSql)
  }

  await conn.end()
  console.log(`[CSF MariaDB Init] Schema & seed ready on \`${database}\`!`)
}

main().catch(err => {
  console.error('[CSF MariaDB Init] Failed:', err.message)
  process.exit(1)
})
