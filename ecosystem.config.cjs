/**
 * PM2 Production Process Config for VPS / Linux Server (uat.csf.co.th & www.csf.co.th)
 * Usage:
 *   npm install
 *   npm run build
 *   pm2 start ecosystem.config.cjs
 */
module.exports = {
  apps: [
    {
      name: 'csf-nuxt',
      script: './.output/server/index.mjs',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 3000
      }
    }
  ]
}
