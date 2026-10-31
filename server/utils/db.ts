import fs from 'node:fs'
import path from 'node:path'
import mysql from 'mysql2/promise'
import { DatabaseSync } from 'node:sqlite'
import { hashPassword } from './auth'
import {
  SEED_ARTICLES,
  SEED_BANNERS,
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_SETTINGS,
  SEED_SOCIAL_INTEGRATIONS
} from './seedData'

type DbEngine = 'mariadb' | 'sqlite_fallback'

interface DbRuntimeState {
  initialized: boolean
  engine: DbEngine
  mariadbPool: mysql.Pool | null
  sqliteDb: DatabaseSync | null
  connectionNote: string
  hostInfo: string
}

const state: DbRuntimeState = {
  initialized: false,
  engine: 'sqlite_fallback',
  mariadbPool: null,
  sqliteDb: null,
  connectionNote: 'กำลังเตรียมฐานข้อมูล...',
  hostInfo: ''
}

let initPromise: Promise<void> | null = null

const SQLITE_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'superadmin',
  is_active INTEGER NOT NULL DEFAULT 1,
  last_login_at TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now', '+7 hours'))
);

CREATE TABLE IF NOT EXISTS banners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  badge TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NULL,
  cta_label TEXT NOT NULL DEFAULT 'ดูสินค้าและโซลูชัน',
  cta_link TEXT NOT NULL DEFAULT '/products',
  secondary_label TEXT NOT NULL DEFAULT 'ขอใบเสนอราคา',
  secondary_link TEXT NOT NULL DEFAULT '/contact',
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now', '+7 hours'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name_th TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT NULL,
  icon TEXT NOT NULL DEFAULT 'Cpu',
  image_url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now', '+7 hours'))
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  brand TEXT NOT NULL DEFAULT 'CSF Partner Brand',
  category_id INTEGER NOT NULL,
  description TEXT NULL,
  specs_json TEXT NULL,
  price_display TEXT NOT NULL DEFAULT 'สอบถามราคาพิเศษ (B2B)',
  price_amount REAL NULL,
  image_url TEXT NOT NULL DEFAULT '',
  datasheet_url TEXT NOT NULL DEFAULT '',
  stock_status TEXT NOT NULL DEFAULT 'พร้อมส่ง / สั่งซื้อองค์กร',
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now', '+7 hours')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', '+7 hours'))
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Product Support',
  cover_image TEXT NOT NULL DEFAULT '',
  author_name TEXT NOT NULL DEFAULT 'ทีมวิศวกร CSF Technology Touch',
  is_published INTEGER NOT NULL DEFAULT 1,
  published_at TEXT NOT NULL DEFAULT (datetime('now', '+7 hours')),
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now', '+7 hours')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', '+7 hours'))
);

CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ref_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  company_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  line_id TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  product_id INTEGER NULL,
  product_sku TEXT NOT NULL DEFAULT '',
  attachments_json TEXT NULL,
  source_channel TEXT NOT NULL DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT NULL,
  notified_line INTEGER NOT NULL DEFAULT 0,
  notified_facebook INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now', '+7 hours')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', '+7 hours'))
);

CREATE TABLE IF NOT EXISTS social_integrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  handle_or_url TEXT NOT NULL DEFAULT '',
  channel_id TEXT NOT NULL DEFAULT '',
  channel_secret TEXT NOT NULL DEFAULT '',
  access_token TEXT NULL,
  verify_token TEXT NOT NULL DEFAULT '',
  target_recipient_id TEXT NOT NULL DEFAULT '',
  qr_code_url TEXT NOT NULL DEFAULT '',
  pixel_id TEXT NOT NULL DEFAULT '',
  auto_reply_enabled INTEGER NOT NULL DEFAULT 1,
  notify_on_inquiry INTEGER NOT NULL DEFAULT 1,
  auto_publish_content INTEGER NOT NULL DEFAULT 0,
  welcome_message TEXT NULL,
  is_enabled INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now', '+7 hours'))
);

CREATE TABLE IF NOT EXISTS social_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL,
  direction TEXT NOT NULL,
  event_type TEXT NOT NULL,
  sender_or_target TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL,
  payload_json TEXT NULL,
  status TEXT NOT NULL DEFAULT 'delivered',
  http_status INTEGER NOT NULL DEFAULT 200,
  created_at TEXT NOT NULL DEFAULT (datetime('now', '+7 hours'))
);

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  setting_group TEXT NOT NULL DEFAULT 'general',
  updated_at TEXT NOT NULL DEFAULT (datetime('now', '+7 hours'))
);

CREATE TABLE IF NOT EXISTS security_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  ip_address TEXT NOT NULL DEFAULT '',
  actor TEXT NOT NULL DEFAULT '',
  target_path TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now', '+7 hours'))
);
`

async function initDatabaseInternal(): Promise<void> {
  if (state.initialized) return

  const config = useRuntimeConfig()
  const dbHost = (config.dbHost || process.env.DB_HOST || '').trim()
  const dbPort = Number(config.dbPort || process.env.DB_PORT || 3306)
  const dbUser = (config.dbUser || process.env.DB_USER || 'csf_user').trim()
  const dbPassword = config.dbPassword || process.env.DB_PASSWORD || 'csf_password_2026'
  const dbName = (config.dbName || process.env.DB_NAME || 'csf_db').trim()

  if (dbHost) {
    try {
      const pool = mysql.createPool({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        waitForConnections: true,
        connectionLimit: 10,
        charset: 'utf8mb4',
        connectTimeout: 2500
      })
      const conn = await pool.getConnection()
      await conn.ping()
      conn.release()

      // Ensure MariaDB tables exist
      const schemaPath = path.resolve(process.cwd(), 'database/schema.sql')
      if (fs.existsSync(schemaPath)) {
        const rawSql = fs.readFileSync(schemaPath, 'utf8')
        const statements = rawSql
          .split(/;\s*\n/)
          .map(s => s.trim())
          .filter(s => s && !s.startsWith('--') && !/^CREATE DATABASE/i.test(s) && !/^USE /i.test(s))
        for (const stmt of statements) {
          await pool.query(stmt)
        }
      }

      state.engine = 'mariadb'
      state.mariadbPool = pool
      state.hostInfo = `${dbHost}:${dbPort}/${dbName}`
      state.connectionNote = `เชื่อมต่อ MariaDB สำเร็จ (${dbHost}:${dbPort}/${dbName})`
      state.initialized = true
      try {
        await pool.query('ALTER TABLE inquiries ADD COLUMN attachments_json LONGTEXT NULL')
      } catch {
        // Column already exists
      }
      await seedIfEmpty()
      return
    } catch (err: any) {
      state.connectionNote = `ไม่พบเซิร์ฟเวอร์ MariaDB ที่ ${dbHost}:${dbPort} (${err?.code || err?.message || 'offline'}) — ระบบสลับใช้ SQL Compatibility Preview Store อัตโนมัติ (พร้อมส่งออก .sql สำหรับ MariaDB ได้ทุกเมื่อ)`
    }
  } else {
    state.connectionNote =
      'โหมด Sandbox Preview (SQLite Relational Engine ใช้งานร่วมกับ Schema เดียวกับ MariaDB 100% — ตั้งค่า DB_HOST เพื่อเชื่อมต่อ MariaDB Server ได้ทันที)'
  }

  const dataDir = path.resolve(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  const sqliteFile = path.join(dataDir, 'csf_preview.sqlite')
  const sqlite = new DatabaseSync(sqliteFile)
  sqlite.exec('PRAGMA journal_mode = WAL;')
  sqlite.exec(SQLITE_SCHEMA)
  try {
    sqlite.exec('ALTER TABLE inquiries ADD COLUMN attachments_json TEXT NULL;')
  } catch {
    // Column already exists
  }

  state.engine = 'sqlite_fallback'
  state.sqliteDb = sqlite
  state.hostInfo = `data/csf_preview.sqlite (MariaDB-Compatible SQL)`
  state.initialized = true

  await seedIfEmpty()
}

export async function ensureDb(): Promise<void> {
  if (state.initialized) return
  if (!initPromise) {
    initPromise = initDatabaseInternal().finally(() => {
      initPromise = null
    })
  }
  await initPromise
}

export async function dbQuery<T = Record<string, any>>(sql: string, params: any[] = []): Promise<T[]> {
  await ensureDb()
  if (state.engine === 'mariadb' && state.mariadbPool) {
    const [rows] = await state.mariadbPool.execute(sql, params)
    return rows as T[]
  }
  if (!state.sqliteDb) throw new Error('Database not initialized')
  const stmt = state.sqliteDb.prepare(sql)
  return stmt.all(...params) as T[]
}

export async function dbQueryOne<T = Record<string, any>>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await dbQuery<T>(sql, params)
  return rows[0] ?? null
}

export async function dbExecute(sql: string, params: any[] = []): Promise<{ insertId: number; affectedRows: number }> {
  await ensureDb()
  if (state.engine === 'mariadb' && state.mariadbPool) {
    const [res] = await state.mariadbPool.execute(sql, params)
    const header = res as mysql.ResultSetHeader
    return {
      insertId: Number(header.insertId || 0),
      affectedRows: Number(header.affectedRows || 0)
    }
  }
  if (!state.sqliteDb) throw new Error('Database not initialized')
  const stmt = state.sqliteDb.prepare(sql)
  const res = stmt.run(...params)
  return {
    insertId: Number(res.lastInsertRowid || 0),
    affectedRows: Number(res.changes || 0)
  }
}

async function seedIfEmpty() {
  const userCountRow = await dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM users')
  if ((userCountRow?.cnt || 0) === 0) {
    const config = useRuntimeConfig()
    const defaultUser = config.adminDefaultUser || 'admin'
    const defaultPass = config.adminDefaultPass || 'csf@2026'
    await dbExecute(
      'INSERT INTO users (username, email, password_hash, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [defaultUser, 'admin@csf.co.th', hashPassword(defaultPass), 'ผู้ดูแลระบบ CSF Technology Touch', 'superadmin', 1]
    )
  }

  const bannerCount = await dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM banners')
  if ((bannerCount?.cnt || 0) === 0) {
    for (const b of SEED_BANNERS) {
      await dbExecute(
        `INSERT INTO banners (badge, title, subtitle, description, cta_label, cta_link, secondary_label, secondary_link, image_url, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          b.badge,
          b.title,
          b.subtitle,
          b.description,
          b.cta_label,
          b.cta_link,
          b.secondary_label,
          b.secondary_link,
          b.image_url,
          b.sort_order,
          b.is_active
        ]
      )
    }
  }

  const catCount = await dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM categories')
  if ((catCount?.cnt || 0) === 0) {
    for (const c of SEED_CATEGORIES) {
      await dbExecute(
        `INSERT INTO categories (id, slug, name_th, name_en, description, icon, image_url, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [c.id, c.slug, c.name_th, c.name_en, c.description, c.icon, c.image_url, c.sort_order]
      )
    }
  }

  const prodCount = await dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM products')
  if ((prodCount?.cnt || 0) === 0) {
    for (const p of SEED_PRODUCTS) {
      await dbExecute(
        `INSERT INTO products (sku, slug, name, subtitle, brand, category_id, description, specs_json, price_display, price_amount, image_url, stock_status, is_featured, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          p.sku,
          p.slug,
          p.name,
          p.subtitle,
          p.brand,
          p.category_id,
          p.description,
          JSON.stringify(p.specs),
          p.price_display,
          p.price_amount,
          p.image_url,
          p.stock_status,
          p.is_featured
        ]
      )
    }
  }

  const artCount = await dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM articles')
  if ((artCount?.cnt || 0) === 0) {
    for (const a of SEED_ARTICLES) {
      await dbExecute(
        `INSERT INTO articles (slug, title, excerpt, content, category, cover_image, author_name, is_published, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [a.slug, a.title, a.excerpt, a.content, a.category, a.cover_image, a.author_name, a.published_at]
      )
    }
  }

  const settingCount = await dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM site_settings')
  if ((settingCount?.cnt || 0) === 0) {
    for (const [key, item] of Object.entries(SEED_SETTINGS)) {
      await dbExecute('INSERT INTO site_settings (setting_key, setting_value, setting_group) VALUES (?, ?, ?)', [
        key,
        item.value,
        item.group
      ])
    }
  }

  const socialCount = await dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM social_integrations')
  if ((socialCount?.cnt || 0) === 0) {
    for (const s of SEED_SOCIAL_INTEGRATIONS) {
      await dbExecute(
        `INSERT INTO social_integrations
         (platform, display_name, handle_or_url, channel_id, channel_secret, access_token, verify_token, target_recipient_id, qr_code_url, pixel_id, auto_reply_enabled, notify_on_inquiry, auto_publish_content, welcome_message, is_enabled)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          s.platform,
          s.display_name,
          s.handle_or_url,
          s.channel_id,
          s.channel_secret,
          s.access_token,
          s.verify_token,
          s.target_recipient_id,
          s.qr_code_url,
          s.pixel_id,
          s.auto_reply_enabled,
          s.notify_on_inquiry,
          s.auto_publish_content,
          s.welcome_message,
          s.is_enabled
        ]
      )
    }
  }

  const inqCount = await dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM inquiries')
  if ((inqCount?.cnt || 0) === 0) {
    await dbExecute(
      `INSERT INTO inquiries (ref_code, customer_name, company_name, email, phone, line_id, subject, message, product_sku, source_channel, status, admin_notes, notified_line, notified_facebook)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'RFQ-202610-001',
        'คุณกิตติพงศ์ วัฒนากูล',
        'บริษัท สยามลอจิสติกส์ พาร์ค จำกัด',
        'kittipong@siamlogistics-example.co.th',
        '089-412-7788',
        '@kittipong.w',
        'ขอใบเสนอราคาเครื่องบันทึก SN-NVR10/08E3/064NSH พร้อมกล้องโดม 32 จุด',
        'ต้องการขอใบเสนอราคาโครงการปรับปรุงระบบ CCTV คลังสินค้าพระราม 2 จำนวน 32 จุด พร้อมเครื่องบันทึก 64CH รองรับ RAID 5 และสวิตช์ PoE+ 24 พอร์ต 2 ตัวครับ',
        'SN-NVR10/08E3/064NSH',
        'website',
        'in_progress',
        'ส่งสเปกเบื้องต้นทางอีเมลและแจ้งเตือนเข้ากลุ่มฝ่ายขาย LINE OA แล้ว',
        1,
        0
      ]
    )
    await dbExecute(
      `INSERT INTO inquiries (ref_code, customer_name, company_name, email, phone, line_id, subject, message, product_sku, source_channel, status, admin_notes, notified_line, notified_facebook)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'RFQ-202610-002',
        'อาจารย์สุพรรณี ศรีวิชัย',
        'วิทยาลัยเทคโนโลยีอาชีวศึกษาธนบุรี',
        'supannee@techcollege-example.ac.th',
        '081-775-2090',
        'supannee_edu',
        'สอบถามชุดระบบเสียงห้องเรียน DSP501 + แอมป์ MP60U จำนวน 12 ห้อง',
        'รบกวนทำใบเสนอราคาลำโพงเพดาน DSP501 ห้องละ 4 ตัว คู่กับเครื่องขยายเสียง MP60U สำหรับอาคารเรียนใหม่ 12 ห้องเรียน ขอราคาหน่วยงานการศึกษาค่ะ',
        'MP60U',
        'line_oa',
        'new',
        '',
        1,
        0
      ]
    )
  }

  const logCount = await dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM social_logs')
  if ((logCount?.cnt || 0) === 0) {
    await dbExecute(
      `INSERT INTO social_logs (platform, direction, event_type, sender_or_target, summary, payload_json, status, http_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'line_oa',
        'inbound',
        'message.text',
        'U89a31c...f42b (ลูกค้าผ่าน LINE OA)',
        'ลูกค้าพิมพ์ค้นหารหัสสินค้า "MP60U" — ระบบตอบกลับสเปก Flex Message อัตโนมัติ',
        JSON.stringify({ keyword: 'MP60U', autoReply: 'MP60U — 60W Mini USB/Tuner/Bluetooth Digital Mixer Amplifier' }),
        'auto_replied',
        200
      ]
    )
    await dbExecute(
      `INSERT INTO social_logs (platform, direction, event_type, sender_or_target, summary, payload_json, status, http_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'line_oa',
        'outbound',
        'lead.push_alert',
        'Admin Sales Group',
        'แจ้งเตือนใบขอราคาใหม่ [RFQ-202610-002] จาก วิทยาลัยเทคโนโลยีอาชีวศึกษาธนบุรี ไปยัง LINE OA ฝ่ายขาย',
        JSON.stringify({ ref: 'RFQ-202610-002', sku: 'MP60U' }),
        'simulated_ok',
        200
      ]
    )
    await dbExecute(
      `INSERT INTO social_logs (platform, direction, event_type, sender_or_target, summary, payload_json, status, http_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'facebook',
        'outbound',
        'page.feed_post',
        'CSF Technology Touch Thailand',
        'เผยแพร่บทความใหม่ "คู่มือเลือกเครื่องบันทึก NVR และออกแบบระบบจัดเก็บข้อมูล RAID" ไปยังเพจ Facebook',
        JSON.stringify({ article: 'enterprise-ip-cctv-nvr-raid-design-guide' }),
        'simulated_ok',
        200
      ]
    )
  }
}

export async function getDbStatus() {
  await ensureDb()
  const [products, categories, articles, inquiries, socialLogs] = await Promise.all([
    dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM products'),
    dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM categories'),
    dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM articles'),
    dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM inquiries'),
    dbQueryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM social_logs')
  ])

  return {
    engine: state.engine,
    hostInfo: state.hostInfo,
    connectionNote: state.connectionNote,
    counts: {
      products: Number(products?.cnt || 0),
      categories: Number(categories?.cnt || 0),
      articles: Number(articles?.cnt || 0),
      inquiries: Number(inquiries?.cnt || 0),
      socialLogs: Number(socialLogs?.cnt || 0)
    }
  }
}

export async function testMariaDbConnection(params: {
  host: string
  port: number
  user: string
  password: string
  database: string
}) {
  const conn = await mysql.createConnection({
    host: params.host,
    port: params.port || 3306,
    user: params.user,
    password: params.password,
    database: params.database,
    connectTimeout: 4000
  })
  const [rows] = await conn.query('SELECT VERSION() as version')
  await conn.end()
  const version = (rows as any[])?.[0]?.version || 'MariaDB'
  return { ok: true, version }
}

function escapeSqlValue(val: any): string {
  if (val === null || val === undefined) return 'NULL'
  if (typeof val === 'number') return Number.isFinite(val) ? String(val) : 'NULL'
  return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`
}

export async function exportMariaDbSqlDump(): Promise<string> {
  await ensureDb()
  const schemaPath = path.resolve(process.cwd(), 'database/schema.sql')
  const schemaHeader = fs.existsSync(schemaPath) ? fs.readFileSync(schemaPath, 'utf8') : ''
  const tables = ['categories', 'banners', 'products', 'articles', 'site_settings', 'social_integrations', 'inquiries']
  const chunks: string[] = [
    `-- CSF Technology Touch (csf.co.th) Live MariaDB SQL Export`,
    `-- Generated at: ${new Date().toISOString()}`,
    schemaHeader,
    `\nSET FOREIGN_KEY_CHECKS = 0;\n`
  ]

  for (const tbl of tables) {
    const rows = await dbQuery<Record<string, any>>(`SELECT * FROM ${tbl}`)
    if (!rows.length) continue
    chunks.push(`-- Data for table \`${tbl}\``)
    chunks.push(`DELETE FROM \`${tbl}\`;`)
    for (const row of rows) {
      const cols = Object.keys(row).map(c => `\`${c}\``).join(', ')
      const vals = Object.values(row).map(escapeSqlValue).join(', ')
      chunks.push(`INSERT INTO \`${tbl}\` (${cols}) VALUES (${vals});`)
    }
    chunks.push('')
  }

  chunks.push('SET FOREIGN_KEY_CHECKS = 1;\n')
  return chunks.join('\n')
}
