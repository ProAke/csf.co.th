import { requireAdmin } from '../../../utils/auth'
import { dbQuery } from '../../../utils/db'
import { listLocalMediaFiles, localUploadExists } from '../../../utils/media'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const files = listLocalMediaFiles()

  const [extProducts, extBanners, extArticles, extCategories] = await Promise.all([
    dbQuery<{ cnt: number }>("SELECT COUNT(*) AS cnt FROM products WHERE image_url LIKE 'http%'"),
    dbQuery<{ cnt: number }>("SELECT COUNT(*) AS cnt FROM banners WHERE image_url LIKE 'http%'"),
    dbQuery<{ cnt: number }>("SELECT COUNT(*) AS cnt FROM articles WHERE cover_image LIKE 'http%'"),
    dbQuery<{ cnt: number }>("SELECT COUNT(*) AS cnt FROM categories WHERE image_url LIKE 'http%'")
  ])

  const externalHotlinkCount =
    Number(extProducts[0]?.cnt || 0) +
    Number(extBanners[0]?.cnt || 0) +
    Number(extArticles[0]?.cnt || 0) +
    Number(extCategories[0]?.cnt || 0)

  return {
    files,
    totalFiles: files.length,
    logoStoredLocally: localUploadExists('/uploads/brand/csf_logo.png'),
    externalHotlinkCount
  }
})
