import fs from 'node:fs'
import path from 'node:path'

let envLoaded = false

/**
 * Loads .env from project root at runtime (essential for `node .output/server/index.mjs`
 * under PM2 / systemd / DirectAdmin where Nuxt CLI is not wrapping the process).
 * Preserves special characters like ^ and ! inside single/double quotes.
 */
export function loadDotEnvRuntime(): void {
  if (envLoaded) return
  envLoaded = true

  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '..', '.env')
  ]

  for (const envPath of candidates) {
    if (!fs.existsSync(envPath)) continue
    try {
      const raw = fs.readFileSync(envPath, 'utf8')
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx <= 0) continue
        const key = trimmed.slice(0, eqIdx).trim()
        let val = trimmed.slice(eqIdx + 1).trim()

        if (
          (val.startsWith("'") && val.endsWith("'")) ||
          (val.startsWith('"') && val.endsWith('"'))
        ) {
          val = val.slice(1, -1)
        }

        if (process.env[key] === undefined || process.env[key] === '') {
          process.env[key] = val
        }
      }
      break
    } catch {
      // Ignore unreadable .env
    }
  }
}

export function getMariaDbRuntimeParams(runtimeConfig?: Record<string, any>) {
  loadDotEnvRuntime()

  const host = String(
    process.env.NUXT_DB_HOST ||
      process.env.DB_HOST ||
      runtimeConfig?.dbHost ||
      'localhost'
  ).trim()

  const port = Number(
    process.env.NUXT_DB_PORT ||
      process.env.DB_PORT ||
      runtimeConfig?.dbPort ||
      3360
  )

  const user = String(
    process.env.NUXT_DB_USER ||
      process.env.DB_USER ||
      runtimeConfig?.dbUser ||
      'pacific_csfnuxt'
  ).trim()

  const password = String(
    process.env.NUXT_DB_PASSWORD ??
      process.env.DB_PASSWORD ??
      runtimeConfig?.dbPassword ??
      ''
  )

  const database = String(
    process.env.NUXT_DB_NAME ||
      process.env.DB_NAME ||
      runtimeConfig?.dbName ||
      'pacific_csfnuxt'
  ).trim()

  return { host, port, user, password, database }
}
