export interface AdminUser {
  id: number
  username: string
  full_name: string
  role: string
}

export function useAdminAuth() {
  const adminUser = useState<AdminUser | null>('csf-office-user', () => null)

  async function adminFetch<T = any>(url: string, options: any = {}): Promise<T> {
    const ssrHeaders = import.meta.server ? useRequestHeaders(['cookie']) : {}
    const headers: Record<string, string> = {
      ...(ssrHeaders as Record<string, string>),
      ...(options.headers || {})
    }
    return await $fetch<T>(url, {
      ...options,
      credentials: 'same-origin',
      headers
    })
  }

  async function checkSession(): Promise<boolean> {
    try {
      const res = await adminFetch<{ authenticated: boolean; user: AdminUser | null }>('/api/auth/me')
      if (res.authenticated && res.user) {
        adminUser.value = res.user
        return true
      }
      adminUser.value = null
      return false
    } catch {
      adminUser.value = null
      return false
    }
  }

  async function login(username: string, password: string) {
    const res = await $fetch<{ ok: boolean; user: AdminUser }>('/api/auth/login', {
      method: 'POST',
      credentials: 'same-origin',
      body: { username, password }
    })
    adminUser.value = res.user
    return res
  }

  async function logout() {
    try {
      await adminFetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    adminUser.value = null
    await navigateTo('/office/login')
  }

  return {
    adminUser,
    adminFetch,
    checkSession,
    login,
    logout
  }
}
