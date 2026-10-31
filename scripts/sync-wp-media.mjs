#!/usr/bin/env node
/**
 * Standalone CLI utility for UAT / Production Server (https://uat.csf.co.th):
 * Pulls csf_logo.png + all original media files from https://www.csf.co.th/wp-json/wp/v2/media
 * and stores them locally inside public/uploads/ so ZERO assets link to the legacy origin.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT_UPLOADS = path.resolve(process.cwd(), 'public', 'uploads')

const PRIORITY_ASSETS = [
  ['https://www.csf.co.th/wp-content/uploads/2018/03/csf_logo.png', 'brand/csf_logo.png'],
  ['https://www.csf.co.th/wp-content/uploads/2018/03/cropped-icon_csf.png', 'brand/cropped-icon_csf.png'],
  ['https://www.csf.co.th/wp-content/uploads/2018/03/csf_head.png', 'brand/csf_head.png'],
  ['https://www.csf.co.th/wp-content/uploads/2018/03/global_etouch.png', 'brand/global_etouch.png'],
  ['https://www.csf.co.th/wp-content/uploads/2018/04/MP60U.png', 'products/mp60u.png'],
  ['https://www.csf.co.th/wp-content/uploads/2018/03/Classroom-Audio-Solution-Mini60.jpeg', 'products/mini60.jpg'],
  ['https://www.csf.co.th/wp-content/uploads/2018/05/5.jpg', 'products/dsp501.jpg'],
  ['https://www.csf.co.th/wp-content/uploads/2018/05/4.jpg', 'products/wa124.jpg'],
  ['https://www.csf.co.th/wp-content/uploads/2018/05/11.jpg', 'products/nl4fx.jpg'],
  ['https://www.csf.co.th/wp-content/uploads/2018/05/10.jpg', 'products/nl2fx.jpg'],
  ['https://www.csf.co.th/wp-content/uploads/2018/05/9.jpg', 'products/np3x.jpg'],
  ['https://www.csf.co.th/wp-content/uploads/2018/05/7.jpg', 'products/nc3mxx.jpg'],
  ['https://www.csf.co.th/wp-content/uploads/2018/05/6.jpg', 'products/nc3fxx.jpg']
]

const FORCE = process.argv.includes('--force')

async function downloadFile(url, relTarget) {
  const fullTarget = path.join(ROOT_UPLOADS, relTarget)
  if (!FORCE && fs.existsSync(fullTarget) && fs.statSync(fullTarget).size > 200) {
    return -1 // already exists locally
  }
  fs.mkdirSync(path.dirname(fullTarget), { recursive: true })
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (CSF-UAT-Media-Sync/1.0)' },
    signal: AbortSignal.timeout(15000)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(fullTarget, buf)
  return buf.length
}

async function main() {
  console.log('=== CSF Local Media Sync (Preparing self-hosted assets for https://uat.csf.co.th) ===')
  let ok = 0
  let fail = 0

  for (const [url, relTarget] of PRIORITY_ASSETS) {
    try {
      const bytes = await downloadFile(url, relTarget)
      console.log(`  [OK] /uploads/${relTarget} (${Math.round(bytes / 1024)} KB)`)
      ok++
    } catch (err) {
      console.warn(`  [SKIP] ${url} -> ${err.message}`)
      fail++
    }
  }

  // Also crawl full WP REST media library (pages 1..3) so 100% of legacy wp-content is archived locally
  for (let page = 1; page <= 3; page++) {
    try {
      const apiRes = await fetch(
        `https://www.csf.co.th/wp-json/wp/v2/media?per_page=50&page=${page}&_fields=id,source_url`,
        { signal: AbortSignal.timeout(10000) }
      )
      if (!apiRes.ok) break
      const items = await apiRes.json()
      if (!Array.isArray(items) || !items.length) break

      for (const item of items) {
        if (!item?.source_url) continue
        const u = new URL(item.source_url)
        const cleanSub = decodeURIComponent(u.pathname).replace(/^\/wp-content\/uploads\//, 'wp-archive/')
        const targetDisk = path.join(ROOT_UPLOADS, cleanSub)
        if (fs.existsSync(targetDisk)) continue
        try {
          const bytes = await downloadFile(item.source_url, cleanSub)
          console.log(`  [ARCHIVED] /uploads/${cleanSub} (${Math.round(bytes / 1024)} KB)`)
          ok++
        } catch {
          fail++
        }
      }
    } catch {
      break
    }
  }

  console.log(`\nDone! Downloaded/Updated: ${ok} files (${fail} skipped). All files stored in public/uploads/`)
}

main()
