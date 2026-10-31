import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      colors: {
        csf: {
          navy: '#0B1426',
          slate: '#0F1D36',
          blue: '#0284C7',
          cyan: '#06B6D4',
          light: '#F0F9FF'
        },
        line: '#06C755',
        facebook: '#1877F2'
      }
    }
  }
}
