import { requireAdmin } from '../../../utils/auth'
import { syncAllOriginAndDbMedia } from '../../../utils/media'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody<{ forceRedownload?: boolean }>(event).catch(() => ({}))

  const summary = await syncAllOriginAndDbMedia({
    timeoutMs: 8000,
    forceRedownload: Boolean(body?.forceRedownload)
  })

  return {
    ok: true,
    ...summary
  }
})
