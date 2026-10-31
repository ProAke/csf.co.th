<template>
  <div class="min-h-screen bg-slate-100 flex">
    <!-- Desktop Sidebar -->
    <aside class="hidden lg:flex lg:w-64 xl:w-72 flex-col bg-csf-navy text-slate-300 shrink-0 border-r border-slate-800">
      <!-- Pure White Brand Header (Official CSF Logo on White Background Only) -->
      <div class="h-16 px-4 bg-white flex items-center justify-between border-b border-slate-200">
        <NuxtLink to="/office" class="flex items-center gap-2.5 min-w-0">
          <BrandLogo variant="light" size="sm" :show-text="false" />
          <div class="min-w-0">
            <div class="text-sm font-extrabold text-slate-900 leading-tight truncate">CSF Backoffice</div>
            <div class="text-[11px] font-semibold text-sky-700 truncate">/office • Secure CMS</div>
          </div>
        </NuxtLink>
      </div>

      <nav class="flex-1 p-3.5 space-y-1 overflow-y-auto">
        <div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">เมนูจัดการหลัก</div>
        <NuxtLink
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition"
          :class="
            isMenuActive(item.to)
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          "
        >
          <component :is="item.icon" class="w-4 h-4 shrink-0" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-slate-800 space-y-2.5">
        <NuxtLink
          to="/"
          target="_blank"
          class="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-300 transition"
        >
          <ExternalLink class="w-3.5 h-3.5" />
          <span>เปิดดูหน้าเว็บไซต์จริง</span>
        </NuxtLink>
        <button
          type="button"
          @click="logout()"
          class="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl border border-slate-700 hover:bg-red-500/15 hover:border-red-400/40 hover:text-red-300 text-xs font-semibold text-slate-400 transition"
        >
          <LogOut class="w-3.5 h-3.5" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Column -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Topbar -->
      <header class="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="mobileSidebar = !mobileSidebar"
            class="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700"
          >
            <Menu class="w-5 h-5" />
          </button>
          <div>
            <h1 class="text-base sm:text-lg font-bold text-slate-900">ระบบบริหารจัดการหลังบ้าน (/office)</h1>
            <p class="hidden sm:block text-xs text-slate-500">Nuxt JS + MariaDB • ไฟล์จัดเก็บในเซิร์ฟเวอร์ 100% • Hardened Security</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink
            to="/office/security"
            class="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold text-emerald-800 transition"
          >
            <ShieldCheck class="w-3.5 h-3.5 text-emerald-600" />
            <span>Security Protected</span>
          </NuxtLink>
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
          >
            <ExternalLink class="w-3.5 h-3.5 text-sky-600" />
            <span>หน้าเว็บหลัก</span>
          </NuxtLink>
          <div v-if="adminUser" class="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div class="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs uppercase">
              {{ adminUser.username.slice(0, 2) }}
            </div>
            <div class="text-xs">
              <div class="font-bold text-slate-800">{{ adminUser.full_name }}</div>
              <div class="text-slate-400">{{ adminUser.role }}</div>
            </div>
          </div>
        </div>
      </header>

      <!-- Mobile Sidebar Drawer -->
      <div
        v-if="mobileSidebar"
        class="lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex"
        @click.self="mobileSidebar = false"
      >
        <div class="w-72 bg-csf-navy text-slate-200 h-full flex flex-col">
          <div class="h-16 px-4 bg-white border-b border-slate-200 flex items-center justify-between">
            <BrandLogo variant="light" size="sm" :show-text="false" />
            <button type="button" @click="mobileSidebar = false" class="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100">✕</button>
          </div>
          <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
            <NuxtLink
              v-for="item in menuItems"
              :key="item.to"
              :to="item.to"
              @click="mobileSidebar = false"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium"
              :class="isMenuActive(item.to) ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800'"
            >
              <component :is="item.icon" class="w-4 h-4" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </nav>
          <div class="p-4 border-t border-slate-800">
            <button
              type="button"
              @click="logout()"
              class="w-full py-2.5 rounded-xl bg-red-500/20 text-red-200 text-xs font-bold"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>

      <!-- Page Body -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <div v-if="checking" class="py-20 text-center text-sm text-slate-500">กำลังตรวจสอบสิทธิ์ความปลอดภัย...</div>
        <slot v-else />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BarChart3,
  BookOpen,
  Database,
  ExternalLink,
  FolderTree,
  HardDriveDownload,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Share2,
  ShieldCheck
} from 'lucide-vue-next'

useHead({
  meta: [{ name: 'robots', content: 'noindex, nofollow, noarchive' }]
})

const route = useRoute()
const mobileSidebar = ref(false)
const checking = ref(true)
const { adminUser, checkSession, logout } = useAdminAuth()

const menuItems = [
  { label: 'ภาพรวมระบบ (Dashboard)', to: '/office', icon: LayoutDashboard },
  { label: 'สไลด์หน้าแรก (Hero Banners)', to: '/office/banners', icon: ImageIcon },
  { label: 'จัดการสินค้า (Products)', to: '/office/products', icon: Package },
  { label: 'หมวดหมู่โซลูชัน (Categories)', to: '/office/categories', icon: FolderTree },
  { label: 'บทความ & ซัพพอร์ต (Articles)', to: '/office/articles', icon: BookOpen },
  { label: 'คลังรูปภาพ & ดูดไฟล์ต้นทาง', to: '/office/media', icon: HardDriveDownload },
  { label: 'ใบขอราคา / ข้อความลูกค้า', to: '/office/inquiries', icon: Inbox },
  { label: 'เชื่อม LINE OA & Facebook', to: '/office/integrations', icon: Share2 },
  { label: 'ติดโค้ด Analytics & FB Tag', to: '/office/tracking', icon: BarChart3 },
  { label: 'ความปลอดภัยระบบ (Security)', to: '/office/security', icon: ShieldCheck },
  { label: 'ข้อมูลบริษัท & ตั้งค่าเว็บ', to: '/office/settings', icon: Settings },
  { label: 'ฐานข้อมูล MariaDB', to: '/office/database', icon: Database }
]

function isMenuActive(to: string) {
  if (to === '/office') return route.path === '/office'
  return route.path.startsWith(to)
}

onMounted(async () => {
  const ok = await checkSession()
  if (!ok) {
    await navigateTo('/office/login')
    return
  }
  checking.value = false
})
</script>
