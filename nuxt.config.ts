// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],

  app: {
    head: {
      htmlAttrs: { lang: 'th' },
      titleTemplate: '%s | CSF Technology Touch — บริษัท ซีเอสเอฟ จำกัด',
      title: 'CSF Digital Touch — ผู้นำเข้าและจัดจำหน่ายอุปกรณ์ IT, IP Network, Audio/Video & CCTV',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'บริษัท ซีเอสเอฟ จำกัด (CSF Technology Touch) ผู้นำเข้าและจัดจำหน่ายอุปกรณ์ IT Solution, Telecom Network, Audio/Video, Broadcasting, CCTV และ Electronic Component ครบวงจร พร้อมบริการหลังการขายมืออาชีพ'
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'CSF Technology Touch (csf.co.th)' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
        }
      ]
    }
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    viewer: false
  },

  runtimeConfig: {
    adminJwtSecret: process.env.ADMIN_JWT_SECRET || 'csf-enterprise-secret-2026',
    dbHost: process.env.DB_HOST || '',
    dbPort: Number(process.env.DB_PORT || 3306),
    dbUser: process.env.DB_USER || 'csf_user',
    dbPassword: process.env.DB_PASSWORD || 'csf_password_2026',
    dbName: process.env.DB_NAME || 'csf_db',
    adminDefaultUser: process.env.ADMIN_DEFAULT_USER || 'admin',
    adminDefaultPass: process.env.ADMIN_DEFAULT_PASS || 'csf@2026',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://uat.csf.co.th'
    }
  },

  vite: {
    server: {
      allowedHosts: true
    }
  },

  nitro: {
    rollupConfig: {
      external: ['node:sqlite']
    },
    routeRules: {
      '/uploads/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'Content-Security-Policy': "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox"
        }
      },
      '/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff'
        }
      }
    }
  }
})
