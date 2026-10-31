<template>
  <header class="sticky top-0 z-40 w-full shadow-sm">
    <!-- Top Corporate Bar (Echoing original CSF dark header identity) -->
    <div class="bg-csf-navy text-slate-300 text-xs border-b border-slate-800/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 truncate">
          <span class="inline-flex items-center gap-1.5 font-medium text-white">
            <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            Welcome to <strong class="font-bold tracking-wide text-sky-300">CSF Technology Touch</strong>
          </span>
          <span class="hidden md:inline text-slate-600">|</span>
          <span class="hidden md:inline text-slate-400">
            {{ settings.working_hours || 'จันทร์ – ศุกร์ 09:00 – 17:00 น.' }}
          </span>
        </div>

        <div class="flex items-center gap-4 shrink-0">
          <a
            :href="`tel:${(settings.phone_primary || '081-308-9678').replace(/[^0-9+]/g, '')}`"
            class="hidden sm:inline-flex items-center gap-1.5 hover:text-white transition"
          >
            <Phone class="w-3.5 h-3.5 text-sky-400" />
            <span class="font-mono font-medium text-white">{{ settings.phone_primary || '081-308-9678' }}</span>
          </a>
          <a
            :href="`mailto:${settings.email_sales || 'sales@csf.co.th'}`"
            class="hidden lg:inline-flex items-center gap-1.5 hover:text-white transition"
          >
            <Mail class="w-3.5 h-3.5 text-sky-400" />
            <span>{{ settings.email_sales || 'sales@csf.co.th' }}</span>
          </a>

          <div class="flex items-center gap-2 pl-2 border-l border-slate-700/80">
            <button
              v-if="social?.line_oa?.is_enabled !== false"
              type="button"
              @click="openLineModal()"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#06C755]/20 text-[#4ade80] hover:bg-[#06C755] hover:text-white transition font-medium"
              title="ติดต่อผ่าน LINE Official Account"
            >
              <MessageCircle class="w-3 h-3" />
              <span>LINE OA</span>
            </button>
            <a
              v-if="social?.facebook?.is_enabled !== false"
              :href="facebookUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1877F2]/20 text-sky-300 hover:bg-[#1877F2] hover:text-white transition font-medium"
              title="เพจ Facebook CSF Technology Touch"
            >
              <Globe class="w-3 h-3" />
              <span>Facebook</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Navigation (Solid Pure White Background for Official CSF Logo) -->
    <div class="bg-white border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <!-- Brand Logo (Official csf_logo.png stored locally) -->
        <NuxtLink to="/" class="flex items-center gap-3 group shrink-0">
          <BrandLogo variant="light" size="md" />
        </NuxtLink>

        <!-- Desktop Links -->
        <nav class="hidden lg:flex items-center gap-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors"
            :class="
              isActiveRoute(item.to)
                ? 'bg-sky-50 text-sky-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            "
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- Desktop Actions -->
        <div class="hidden sm:flex items-center gap-2.5">
          <button
            type="button"
            @click="openLineModal()"
            class="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#06C755]/30 bg-[#06C755]/10 text-[#059669] hover:bg-[#06C755] hover:text-white text-sm font-semibold transition"
          >
            <MessageCircle class="w-4 h-4" />
            <span class="hidden xl:inline">{{ social?.line_oa?.handle_or_url || '@csf.co.th' }}</span>
            <span class="xl:hidden">LINE OA</span>
          </button>

          <button
            type="button"
            @click="openQuoteModal(null)"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-csf-navy hover:bg-sky-700 text-white text-sm font-semibold shadow-sm transition"
          >
            <FileText class="w-4 h-4 text-sky-300" />
            <span>ขอใบเสนอราคา</span>
          </button>
        </div>

        <!-- Mobile Menu Toggle -->
        <button
          type="button"
          @click="mobileOpen = !mobileOpen"
          class="lg:hidden p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
          aria-label="เปิดเมนูนำทาง"
        >
          <X v-if="mobileOpen" class="w-5 h-5" />
          <Menu v-else class="w-5 h-5" />
        </button>
      </div>

      <!-- Mobile Menu Drawer -->
      <div v-if="mobileOpen" class="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          @click="mobileOpen = false"
          class="block px-4 py-2.5 rounded-xl text-sm font-semibold"
          :class="isActiveRoute(item.to) ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50'"
        >
          {{ item.label }}
        </NuxtLink>
        <div class="pt-2 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            @click="mobileOpen = false; openLineModal()"
            class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#06C755] text-white text-sm font-semibold"
          >
            <MessageCircle class="w-4 h-4" />
            <span>แอด LINE OA</span>
          </button>
          <button
            type="button"
            @click="mobileOpen = false; openQuoteModal(null)"
            class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-csf-navy text-white text-sm font-semibold"
          >
            <FileText class="w-4 h-4" />
            <span>ขอใบเสนอราคา</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { FileText, Globe, Mail, Menu, MessageCircle, Phone, X } from 'lucide-vue-next'

const route = useRoute()
const mobileOpen = ref(false)
const { siteState, openQuoteModal, openLineModal, facebookUrl } = useSiteData()

const settings = computed(() => siteState.value?.settings || {})
const social = computed(() => siteState.value?.social || {})

const navItems = [
  { label: 'หน้าแรก', to: '/' },
  { label: 'สินค้าและโซลูชัน', to: '/products' },
  { label: 'เกี่ยวกับ CSF', to: '/about' },
  { label: 'ความรู้ & ซัพพอร์ต', to: '/knowledge' },
  { label: 'ติดต่อเรา', to: '/contact' }
]

function isActiveRoute(target: string) {
  if (target === '/') return route.path === '/'
  return route.path.startsWith(target)
}
</script>
