import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { dbExecute, dbQuery } from './db'
import { validateFileSignature } from './security'

export interface SyncMediaItem {
  sourceUrl: string
  localPath: string // relative URL starting with /uploads/...
  category: 'brand' | 'products' | 'articles' | 'corporate' | 'banners' | 'custom'
  sku?: string
}

/**
 * Complete canonical mapping of original https://www.csf.co.th WordPress media assets
 * so UAT / Production servers can pull 100% of original assets locally with zero hotlinks.
 */
export const ORIGIN_WP_MEDIA_MANIFEST: SyncMediaItem[] = [
  // Official Brand Identity
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/03/csf_logo.png',
    localPath: '/uploads/brand/csf_logo.png',
    category: 'brand'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/03/cropped-icon_csf.png',
    localPath: '/uploads/brand/cropped-icon_csf.png',
    category: 'brand'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/03/csf_head.png',
    localPath: '/uploads/brand/csf_head.png',
    category: 'brand'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/03/global_etouch.png',
    localPath: '/uploads/brand/global_etouch.png',
    category: 'brand'
  },

  // Audio / Video Products (Original csf.co.th uploads)
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/5.jpg',
    localPath: '/uploads/products/dsp501.jpg',
    category: 'products',
    sku: 'DSP501'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/4.jpg',
    localPath: '/uploads/products/wa124.jpg',
    category: 'products',
    sku: 'WA124'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/04/MP60U.png',
    localPath: '/uploads/products/mp60u.png',
    category: 'products',
    sku: 'MP60U'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/03/Classroom-Audio-Solution-Mini60.jpeg',
    localPath: '/uploads/products/mini60.jpg',
    category: 'products',
    sku: 'Mini60'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/11.jpg',
    localPath: '/uploads/products/nl4fx.jpg',
    category: 'products',
    sku: 'NL4FX'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/10.jpg',
    localPath: '/uploads/products/nl2fx.jpg',
    category: 'products',
    sku: 'NL2FX'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/9.jpg',
    localPath: '/uploads/products/np3x.jpg',
    category: 'products',
    sku: 'NP3X'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/8.jpg',
    localPath: '/uploads/products/np2x.jpg',
    category: 'products',
    sku: 'NP2X'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/7.jpg',
    localPath: '/uploads/products/nc3mxx.jpg',
    category: 'products',
    sku: 'NC3MXX'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/6.jpg',
    localPath: '/uploads/products/nc3fxx.jpg',
    category: 'products',
    sku: 'NC3FXX'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/12.jpg',
    localPath: '/uploads/products/2xlr.jpg',
    category: 'products',
    sku: '2XLR-3M'
  },

  // CCTV Solution Products (Original csf.co.th Sunell uploads)
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/5-3.jpg',
    localPath: '/uploads/products/sn-nvr10-08e3-064nsh.jpg',
    category: 'products',
    sku: 'SN-NVR10/08E3/064NSH'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/6-2.jpg',
    localPath: '/uploads/products/sn-nvr10-08e3-032ns.jpg',
    category: 'products',
    sku: 'SN-NVR10/08E3/032NS'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/8-2.jpg',
    localPath: '/uploads/products/sn-nvr10-04e3-016nse.jpg',
    category: 'products',
    sku: 'SN-NVR10/04E3/016NSE'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/1-1.jpg',
    localPath: '/uploads/products/sn-nvr10-02e3-016nse.jpg',
    category: 'products',
    sku: 'SN-NVR10/02E3/016NSE'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/1.jpg',
    localPath: '/uploads/products/sn-ipv57-20udr-z.jpg',
    category: 'products',
    sku: 'SN-IPV57/20UDR/Z'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/2.jpg',
    localPath: '/uploads/products/sn-ipv57-41udr-z.jpg',
    category: 'products',
    sku: 'SN-IPV57/41UDR/Z'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/19.jpg',
    localPath: '/uploads/products/sn-ipv56-60hdr.jpg',
    category: 'products',
    sku: 'SN-IPV56/60HDR'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/13.jpg',
    localPath: '/uploads/products/sn-ips57-30bdn-zsd30.jpg',
    category: 'products',
    sku: 'SN-IPS57/30BDN/ZSD30'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/12-1.jpg',
    localPath: '/uploads/products/sn-ips56-30cdr-zsd12t.jpg',
    category: 'products',
    sku: 'SN-IPS56-30CDR-ZSD12T'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/21.jpg',
    localPath: '/uploads/products/sn-ipr57-04bydn.jpg',
    category: 'products',
    sku: 'SN-IPR57/04BYDN'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/16-1.jpg',
    localPath: '/uploads/products/sn-cbk625.jpg',
    category: 'products',
    sku: 'SN-CBK625'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/15-1.jpg',
    localPath: '/uploads/products/sn-cbk624.jpg',
    category: 'products',
    sku: 'SN-CBK624'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/14-1.jpg',
    localPath: '/uploads/products/sn-cbk626.jpg',
    category: 'products',
    sku: 'SN-CBK626'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/13-1.jpg',
    localPath: '/uploads/products/sn-cbk627.jpg',
    category: 'products',
    sku: 'SN-CBK627'
  },
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/05/11-3.jpg',
    localPath: '/uploads/products/sn-cbk629.jpg',
    category: 'products',
    sku: 'SN-CBK629'
  },

  // Support / Knowledge
  {
    sourceUrl: 'https://www.csf.co.th/wp-content/uploads/2018/04/global-document-camera-for-smart-classroom-market-1.jpg',
    localPath: '/uploads/articles/classroom-support.jpg',
    category: 'articles'
  }
]

const ALLOWED_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.ico',
  '.pdf',
  '.xls',
  '.xlsx',
  '.csv',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx'
])

const MIME_TO_EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/x-icon': '.ico',
  'application/pdf': '.pdf',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/csv': '.csv',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx'
}

export function getUploadsRootDir(): string {
  const dir = path.resolve(process.cwd(), 'public', 'uploads')
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

export function resolveLocalUploadDiskPath(relativeUrl: string): string | null {
  if (!relativeUrl.startsWith('/uploads/')) return null
  const root = getUploadsRootDir()
  const subPath = relativeUrl.replace(/^\/uploads\/+/, '')
  const resolved = path.resolve(root, subPath)
  if (!resolved.startsWith(root + path.sep)) return null
  return resolved
}

export function localUploadExists(relativeUrl: string): boolean {
  const diskPath = resolveLocalUploadDiskPath(relativeUrl)
  if (!diskPath) return false
  try {
    const st = fs.statSync(diskPath)
    return st.isFile() && st.size > 0
  } catch {
    return false
  }
}

function isSafeExternalUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    const host = parsed.hostname.toLowerCase()
    if (
      host === 'localhost' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host === '[::1]' ||
      host.endsWith('.local') ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^169\.254\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function sanitizeFolder(folder?: string): string {
  const clean = String(folder || 'custom')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
  return clean || 'custom'
}

function sanitizeBaseName(name: string): string {
  const base = name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return base || 'asset'
}

export function saveUploadedBuffer(options: {
  buffer: Buffer
  originalFilename?: string
  mimeType?: string
  folder?: string
  exactRelativePath?: string
}): string {
  if (!options.buffer || options.buffer.length === 0) {
    throw new Error('ไฟล์ว่างเปล่า ไม่สามารถบันทึกได้')
  }
  if (options.buffer.length > 25 * 1024 * 1024) {
    throw new Error('ขนาดไฟล์เกินกำหนดสูงสุด (25 MB ต่อไฟล์)')
  }

  if (options.exactRelativePath && options.exactRelativePath.startsWith('/uploads/')) {
    const exactExt = path.extname(options.exactRelativePath).toLowerCase()
    const sigCheck = validateFileSignature(options.buffer, exactExt)
    if (!sigCheck.valid) {
      throw new Error(sigCheck.reason || 'ไฟล์ไม่ผ่านการตรวจสอบโครงสร้างความปลอดภัย')
    }
    const targetDisk = resolveLocalUploadDiskPath(options.exactRelativePath)
    if (!targetDisk) throw new Error('Invalid target upload path')
    fs.mkdirSync(path.dirname(targetDisk), { recursive: true })
    fs.writeFileSync(targetDisk, options.buffer)
    return options.exactRelativePath
  }

  const folder = sanitizeFolder(options.folder)
  const rawExt = path.extname(options.originalFilename || '').toLowerCase()
  const extFromMime = options.mimeType ? MIME_TO_EXT[options.mimeType.split(';')[0].trim().toLowerCase()] : ''
  const ext = ALLOWED_EXTENSIONS.has(rawExt)
    ? rawExt
    : extFromMime && ALLOWED_EXTENSIONS.has(extFromMime)
      ? extFromMime
      : '.jpg'

  const sigCheck = validateFileSignature(options.buffer, ext)
  if (!sigCheck.valid) {
    throw new Error(sigCheck.reason || 'ไฟล์ไม่ผ่านการตรวจสอบโครงสร้างความปลอดภัย (Magic-Byte Mismatch)')
  }

  const base = folder === 'inquiries' ? 'doc' : sanitizeBaseName(path.basename(options.originalFilename || 'image'))
  const rand = crypto.randomBytes(6).toString('hex')
  const filename = `${base}-${rand}${ext}`
  const relativeUrl = `/uploads/${folder}/${filename}`
  const diskPath = resolveLocalUploadDiskPath(relativeUrl)
  if (!diskPath) throw new Error('ไม่สามารถสร้างพาธสำหรับจัดเก็บไฟล์ได้')

  fs.mkdirSync(path.dirname(diskPath), { recursive: true })
  fs.writeFileSync(diskPath, options.buffer)
  return relativeUrl
}

/**
 * Downloads an external http(s) image/document URL and stores it locally under /uploads/...
 * so the database and frontend NEVER hotlink to external/origin servers.
 */
export async function localizeExternalAssetUrl(
  rawUrl: string | null | undefined,
  options: {
    folder?: string
    exactRelativePath?: string
    timeoutMs?: number
    forceRedownload?: boolean
    strict?: boolean
  } = {}
): Promise<{ localUrl: string; downloaded: boolean; warning?: string }> {
  const trimmed = String(rawUrl || '').trim()
  if (!trimmed) {
    return { localUrl: '', downloaded: false }
  }

  // Already local path
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return { localUrl: trimmed, downloaded: false }
  }

  // Check if URL matches known canonical item from csf.co.th
  const knownItem = ORIGIN_WP_MEDIA_MANIFEST.find(
    (m) => m.sourceUrl.toLowerCase() === trimmed.toLowerCase()
  )
  const targetExactPath = options.exactRelativePath || knownItem?.localPath

  if (targetExactPath && !options.forceRedownload && localUploadExists(targetExactPath)) {
    return { localUrl: targetExactPath, downloaded: false }
  }

  const parsed = isSafeExternalUrl(trimmed)
  if (!parsed) {
    if (options.strict) {
      throw new Error('URL ไม่ถูกต้องหรือไม่อนุญาตให้เชื่อมต่อ')
    }
    return { localUrl: trimmed, downloaded: false, warning: 'Invalid external URL' }
  }

  const folder = sanitizeFolder(options.folder || knownItem?.category || 'custom')
  const urlBasename = decodeURIComponent(path.basename(parsed.pathname) || 'asset')
  const urlHash = crypto.createHash('sha1').update(trimmed).digest('hex').slice(0, 10)
  const rawExt = path.extname(urlBasename).toLowerCase()
  const deterministicRel =
    targetExactPath ||
    `/uploads/${folder}/${sanitizeBaseName(urlBasename)}-${urlHash}${ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : '.jpg'}`

  if (!options.forceRedownload && localUploadExists(deterministicRel)) {
    return { localUrl: deterministicRel, downloaded: false }
  }

  try {
    const res = await fetch(parsed.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CSFMediaLocalizer/1.0; +https://uat.csf.co.th)',
        Accept: 'image/avif,image/webp,image/apng,image/*,application/pdf,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(options.timeoutMs ?? 8000)
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`)
    }

    const contentType = (res.headers.get('content-type') || '').toLowerCase()
    if (
      contentType &&
      !contentType.startsWith('image/') &&
      !contentType.includes('application/pdf') &&
      !contentType.includes('octet-stream')
    ) {
      throw new Error(`ไฟล์ปลายทางไม่ใช่รูปภาพหรือเอกสาร PDF (${contentType})`)
    }

    const arrayBuf = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuf)
    const savedRel = saveUploadedBuffer({
      buffer,
      originalFilename: urlBasename,
      mimeType: contentType,
      folder,
      exactRelativePath: deterministicRel
    })

    return { localUrl: savedRel, downloaded: true }
  } catch (err: any) {
    if (options.strict) {
      throw new Error(
        `ไม่สามารถดูดไฟล์จาก URL ต้นทางได้ (${err?.message || 'Network unreachable'}). แนะนำให้อัปโหลดไฟล์จากเครื่องโดยตรง หรือรันบนเซิร์ฟเวอร์ UAT ที่ออกอินเทอร์เน็ตได้`
      )
    }
    // If target file already exists locally as fallback, use it; otherwise keep deterministic local path if known
    if (localUploadExists(deterministicRel)) {
      return { localUrl: deterministicRel, downloaded: false }
    }
    return {
      localUrl: knownItem ? knownItem.localPath : trimmed,
      downloaded: false,
      warning: err?.message || 'Download failed'
    }
  }
}

/**
 * Scans HTML content for external <img src="https://..."> and PDF links from origin,
 * downloading them locally and rewriting HTML attributes to /uploads/...
 */
export async function localizeHtmlAssets(html: string | null | undefined, folder = 'articles'): Promise<string> {
  const input = String(html || '')
  if (!input || !input.includes('http')) return input

  const imgRegex = /(<img\b[^>]*?\bsrc=["'])(https?:\/\/[^"']+)(["'][^>]*>)/gi
  const matches = [...input.matchAll(imgRegex)]
  if (!matches.length) return input

  let output = input
  for (const m of matches) {
    const externalUrl = m[2]
    const localized = await localizeExternalAssetUrl(externalUrl, { folder, timeoutMs: 5000 })
    if (localized.localUrl && localized.localUrl !== externalUrl) {
      output = output.split(externalUrl).join(localized.localUrl)
    }
  }
  return output
}

export interface MediaFileInfo {
  url: string
  filename: string
  folder: string
  size: number
  updatedAt: string
}

export function listLocalMediaFiles(): MediaFileInfo[] {
  const root = getUploadsRootDir()
  const items: MediaFileInfo[] = []

  function walk(currentDir: string, relPrefix: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath, relPrefix ? `${relPrefix}/${entry.name}` : entry.name)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        if (!ALLOWED_EXTENSIONS.has(ext)) continue
        const st = fs.statSync(fullPath)
        const folder = relPrefix || 'root'
        items.push({
          url: `/uploads/${relPrefix ? `${relPrefix}/${entry.name}` : entry.name}`,
          filename: entry.name,
          folder,
          size: st.size,
          updatedAt: st.mtime.toISOString()
        })
      }
    }
  }

  walk(root, '')
  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

/**
 * Syncs all canonical origin assets from csf.co.th AND scans MariaDB/SQLite tables
 * to ensure zero external hotlinks remain in products, banners, categories, articles, or settings.
 */
export async function syncAllOriginAndDbMedia(options: {
  timeoutMs?: number
  forceRedownload?: boolean
} = {}) {
  const timeoutMs = options.timeoutMs ?? 6000
  let downloadedCount = 0
  let alreadyLocalCount = 0
  let failedCount = 0
  let dbUpdatedCount = 0
  const errors: string[] = []

  // 1. Download canonical manifest items (Logo + original product photos)
  for (const item of ORIGIN_WP_MEDIA_MANIFEST) {
    if (!options.forceRedownload && localUploadExists(item.localPath)) {
      alreadyLocalCount++
      continue
    }
    const res = await localizeExternalAssetUrl(item.sourceUrl, {
      folder: item.category,
      exactRelativePath: item.localPath,
      timeoutMs,
      forceRedownload: options.forceRedownload
    })
    if (res.downloaded) {
      downloadedCount++
      if (item.sku) {
        await dbExecute('UPDATE products SET image_url = ? WHERE sku = ? AND (image_url LIKE ? OR image_url LIKE ?)', [
          item.localPath,
          item.sku,
          'http%',
          '/images/%'
        ])
      }
    } else if (localUploadExists(item.localPath)) {
      alreadyLocalCount++
    } else {
      failedCount++
      if (res.warning && errors.length < 5) {
        errors.push(`${path.basename(item.localPath)}: ${res.warning}`)
      }
    }
  }

  // 2. Scan database records for any remaining http(s):// image URLs and localize them
  const products = await dbQuery<{ id: number; image_url: string; datasheet_url: string | null }>(
    "SELECT id, image_url, datasheet_url FROM products WHERE image_url LIKE 'http%' OR datasheet_url LIKE 'http%'"
  )
  for (const p of products) {
    let nextImg = p.image_url
    let nextPdf = p.datasheet_url
    if (nextImg && nextImg.startsWith('http')) {
      const r = await localizeExternalAssetUrl(nextImg, { folder: 'products', timeoutMs })
      if (r.localUrl && r.localUrl.startsWith('/')) nextImg = r.localUrl
    }
    if (nextPdf && nextPdf.startsWith('http')) {
      const r = await localizeExternalAssetUrl(nextPdf, { folder: 'products', timeoutMs })
      if (r.localUrl && r.localUrl.startsWith('/')) nextPdf = r.localUrl
    }
    if (nextImg !== p.image_url || nextPdf !== p.datasheet_url) {
      await dbExecute('UPDATE products SET image_url = ?, datasheet_url = ? WHERE id = ?', [nextImg, nextPdf || '', p.id])
      dbUpdatedCount++
    }
  }

  const banners = await dbQuery<{ id: number; image_url: string }>(
    "SELECT id, image_url FROM banners WHERE image_url LIKE 'http%'"
  )
  for (const b of banners) {
    const r = await localizeExternalAssetUrl(b.image_url, { folder: 'banners', timeoutMs })
    if (r.localUrl && r.localUrl.startsWith('/') && r.localUrl !== b.image_url) {
      await dbExecute('UPDATE banners SET image_url = ? WHERE id = ?', [r.localUrl, b.id])
      dbUpdatedCount++
    }
  }

  const articles = await dbQuery<{ id: number; cover_image: string }>(
    "SELECT id, cover_image FROM articles WHERE cover_image LIKE 'http%'"
  )
  for (const a of articles) {
    const r = await localizeExternalAssetUrl(a.cover_image, { folder: 'articles', timeoutMs })
    if (r.localUrl && r.localUrl.startsWith('/') && r.localUrl !== a.cover_image) {
      await dbExecute('UPDATE articles SET cover_image = ? WHERE id = ?', [r.localUrl, a.id])
      dbUpdatedCount++
    }
  }

  const categories = await dbQuery<{ id: number; image_url: string }>(
    "SELECT id, image_url FROM categories WHERE image_url LIKE 'http%'"
  )
  for (const c of categories) {
    const r = await localizeExternalAssetUrl(c.image_url, { folder: 'banners', timeoutMs })
    if (r.localUrl && r.localUrl.startsWith('/') && r.localUrl !== c.image_url) {
      await dbExecute('UPDATE categories SET image_url = ? WHERE id = ?', [r.localUrl, c.id])
      dbUpdatedCount++
    }
  }

  const socialRows = await dbQuery<{ platform: string; qr_code_url: string }>(
    "SELECT platform, qr_code_url FROM social_integrations WHERE qr_code_url LIKE 'http%'"
  )
  for (const sr of socialRows) {
    const r = await localizeExternalAssetUrl(sr.qr_code_url, { folder: 'brand', timeoutMs })
    if (r.localUrl && r.localUrl.startsWith('/') && r.localUrl !== sr.qr_code_url) {
      await dbExecute('UPDATE social_integrations SET qr_code_url = ? WHERE platform = ?', [r.localUrl, sr.platform])
      dbUpdatedCount++
    }
  }

  const logoSetting = await dbQuery<{ setting_key: string; setting_value: string }>(
    "SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('site_logo', 'site_favicon') AND setting_value LIKE 'http%'"
  )
  for (const s of logoSetting) {
    const r = await localizeExternalAssetUrl(s.setting_value, { folder: 'brand', timeoutMs })
    if (r.localUrl && r.localUrl.startsWith('/')) {
      await dbExecute('UPDATE site_settings SET setting_value = ? WHERE setting_key = ?', [r.localUrl, s.setting_key])
      dbUpdatedCount++
    }
  }

  return {
    downloadedCount,
    alreadyLocalCount,
    failedCount,
    dbUpdatedCount,
    logoReadyLocally: localUploadExists('/uploads/brand/csf_logo.png'),
    errors
  }
}
