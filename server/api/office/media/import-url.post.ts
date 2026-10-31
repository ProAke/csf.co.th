import { requireAdmin } from '../../../utils/auth'
import { localizeExternalAssetUrl } from '../../../utils/media'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const body = await readBody<{
    url?: string
    folder?: string
    exactPath?: string
  }>(event)

  const rawUrl = String(body?.url || '').trim()
  if (!rawUrl) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุ URL ของรูปภาพที่ต้องการดูดมาเก็บ' })
  }

  try {
    const result = await localizeExternalAssetUrl(rawUrl, {
      folder: body?.folder || 'custom',
      exactRelativePath: body?.exactPath?.startsWith('/uploads/') ? body.exactPath : undefined,
      timeoutMs: 12000,
      forceRedownload: true,
      strict: true
    })

    return {
      ok: true,
      url: result.localUrl,
      downloaded: result.downloaded
    }
  } catch (err: any) {
    throw createError({
      statusCode: 422,
      statusMessage: err?.message || 'ไม่สามารถดาวน์โหลดรูปภาพจาก URL ต้นทางได้'
    })
  }
})
