import fs from 'node:fs'
import path from 'node:path'
import { getQuery } from 'h3'
import { resolveLocalUploadDiskPath } from '../../utils/media'

const EXT_TO_MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv; charset=utf-8',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
}

const FORCE_DOWNLOAD_EXTS = new Set(['.xls', '.xlsx', '.csv', '.doc', '.docx', '.ppt', '.pptx'])

export default defineEventHandler((event) => {
  const rawParam = getRouterParam(event, 'path') || ''
  const relUrl = `/uploads/${rawParam.replace(/^\/+/, '')}`
  const diskPath = resolveLocalUploadDiskPath(relUrl)

  if (!diskPath || !fs.existsSync(diskPath)) {
    throw createError({ statusCode: 404, statusMessage: 'Local media file not found' })
  }

  const stat = fs.statSync(diskPath)
  if (!stat.isFile()) {
    throw createError({ statusCode: 404, statusMessage: 'Not a file' })
  }

  const ext = path.extname(diskPath).toLowerCase()
  const mime = EXT_TO_MIME[ext] || 'application/octet-stream'
  const query = getQuery(event)
  const filename = path.basename(diskPath)

  setHeader(event, 'Content-Type', mime)
  setHeader(event, 'Content-Length', stat.size)
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  // Prevent any uploaded asset from executing scripts when opened directly
  setHeader(event, 'Content-Security-Policy', "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox")
  setHeader(event, 'Cache-Control', 'public, max-age=86400')

  if (query.download === '1' || FORCE_DOWNLOAD_EXTS.has(ext) || !EXT_TO_MIME[ext]) {
    setHeader(event, 'Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`)
  }

  return sendStream(event, fs.createReadStream(diskPath))
})
