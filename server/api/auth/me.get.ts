import { computePasswordFingerprint, getAdminFromEvent, getJwtSecretRuntime } from '../../utils/auth'
import { dbQueryOne } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const admin = getAdminFromEvent(event)
  if (!admin) {
    return { authenticated: false, user: null }
  }

  const secret = getJwtSecretRuntime(event)
  const dbUser = await dbQueryOne<{
    id: number
    username: string
    full_name: string
    role: string
    password_hash: string
    is_active: number
  }>('SELECT id, username, full_name, role, password_hash, is_active FROM users WHERE id = ?', [admin.sub])

  if (!dbUser || !dbUser.is_active) {
    return { authenticated: false, user: null }
  }

  if (admin.pwd_sig) {
    const currentSig = computePasswordFingerprint(dbUser.password_hash, secret)
    if (admin.pwd_sig !== currentSig) {
      return { authenticated: false, user: null }
    }
  }

  return {
    authenticated: true,
    user: {
      id: dbUser.id,
      username: dbUser.username,
      full_name: dbUser.full_name,
      role: dbUser.role
    }
  }
})
