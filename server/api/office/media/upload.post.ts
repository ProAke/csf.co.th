import { requireAdmin } from '../../../utils/auth'
import { sanitizeFolder, saveUploadedBuffer } from '../../../utils/media'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const contentType = getHeader(event, 'content-type') || ''

  // Support multipart/form-data file upload
  if (contentType.includes('multipart/form-data')) {
    const parts = await readMultipartFormData(event)
    if (!parts || !parts.length) {
      throw createError({ statusCode: 400, statusMessage: 'ไม่พบไฟล์ที่อัปโหลด' })
    }

    const filePart = parts.find((p) => p.name === 'file' && p.data?.length)
    const folderPart = parts.find((p) => p.name === 'folder')
    const exactPathPart = parts.find((p) => p.name === 'exactPath')

    if (!filePart || !filePart.data) {
      throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกไฟล์รูปภาพหรือเอกสาร' })
    }

    const folder = sanitizeFolder(folderPart ? folderPart.data.toString('utf8') : 'custom')
    const exactRelativePath = exactPathPart ? exactPathPart.data.toString('utf8').trim() : undefined

    try {
      const localUrl = saveUploadedBuffer({
        buffer: Buffer.from(filePart.data),
        originalFilename: filePart.filename || 'upload.png',
        mimeType: filePart.type,
        folder,
        exactRelativePath: exactRelativePath?.startsWith('/uploads/') ? exactRelativePath : undefined
      })

      return { ok: true, url: localUrl }
    } catch (err: any) {
      throw createError({ statusCode: 400, statusMessage: err?.message || 'อัปโหลดไฟล์ไม่สำเร็จ' })
    }
  }

  // Also support JSON base64 upload fallback
  const body = await readBody<{
    dataUrl?: string
    filename?: string
    folder?: string
    exactPath?: string
  }>(event)

  const match = String(body?.dataUrl || '').match(/^data:([^;]+);base64,(.+)$/)
  if (!match) {
    throw createError({ statusCode: 400, statusMessage: 'รูปแบบข้อมูลไฟล์ไม่ถูกต้อง' })
  }

  try {
    const mimeType = match[1]
    const buffer = Buffer.from(match[2], 'base64')
    const localUrl = saveUploadedBuffer({
      buffer,
      originalFilename: body?.filename || 'upload.png',
      mimeType,
      folder: sanitizeFolder(body?.folder || 'custom'),
      exactRelativePath: body?.exactPath?.startsWith('/uploads/') ? body.exactPath : undefined
    })

    return { ok: true, url: localUrl }
  } catch (err: any) {
    throw createError({ statusCode: 400, statusMessage: err?.message || 'บันทึกไฟล์ไม่สำเร็จ' })
  }
})
