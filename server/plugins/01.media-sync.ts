import { localUploadExists, localizeExternalAssetUrl, syncAllOriginAndDbMedia } from '../utils/media'

export default defineNitroPlugin(() => {
  // Run non-blocking background check on server boot so UAT/Production servers
  // automatically cache csf_logo.png & original wp-content assets locally.
  setTimeout(async () => {
    try {
      if (!localUploadExists('/uploads/brand/csf_logo.png')) {
        const probe = await localizeExternalAssetUrl(
          'https://www.csf.co.th/wp-content/uploads/2018/03/csf_logo.png',
          {
            folder: 'brand',
            exactRelativePath: '/uploads/brand/csf_logo.png',
            timeoutMs: 2500
          }
        )
        if (probe.downloaded) {
          await syncAllOriginAndDbMedia({ timeoutMs: 6000 })
        }
      }
    } catch {
      // Silently ignore in offline/firewalled dev sandboxes
    }
  }, 500)
})
