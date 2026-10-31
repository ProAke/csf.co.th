<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900">คลังรูปภาพ &amp; ระบบดูดไฟล์ต้นทางเก็บในเครื่อง (Local Media Hub)</h2>
        <p class="text-xs text-slate-500">
          จัดเก็บรูปโลโก้ สินค้า แบนเนอร์ และบทความไว้ในเซิร์ฟเวอร์โดยตรง (<code>/uploads/...</code>) ไม่ผูกกับเว็บต้นทาง พร้อมสำหรับขึ้น <strong>https://uat.csf.co.th</strong> ก่อนทับเว็บจริง
        </p>
      </div>

      <button
        type="button"
        :disabled="syncing"
        @click="runOriginSync(false)"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-csf-navy hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm shrink-0"
      >
        <RefreshCw class="w-4 h-4" :class="syncing ? 'animate-spin' : ''" />
        <span>{{ syncing ? 'กำลังดูดไฟล์ต้นทางเก็บในเครื่อง...' : 'ดูดรูปต้นทางทั้งหมดเก็บในเซิร์ฟเวอร์' }}</span>
      </button>
    </div>

    <!-- Status Banner -->
    <div
      v-if="notice"
      class="p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3"
      :class="
        noticeError
          ? 'bg-amber-50 border-amber-200 text-amber-800'
          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
      "
    >
      <span>{{ notice }}</span>
      <button type="button" @click="notice = ''" class="font-bold">✕</button>
    </div>

    <!-- UAT Readiness Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
        <div class="text-xs font-bold text-slate-500">ไฟล์รูปภาพที่เก็บในเซิร์ฟเวอร์ (/uploads)</div>
        <div class="text-2xl font-extrabold text-slate-900">{{ mediaData.totalFiles }} ไฟล์</div>
        <div class="text-[11px] text-emerald-600 font-semibold">✓ พร้อมใช้งานแบบ Self-Hosted 100%</div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
        <div class="text-xs font-bold text-slate-500">ลิงก์รูปภายนอกที่ค้างในฐานข้อมูล</div>
        <div
          class="text-2xl font-extrabold"
          :class="mediaData.externalHotlinkCount === 0 ? 'text-emerald-600' : 'text-amber-600'"
        >
          {{ mediaData.externalHotlinkCount }} รายการ
        </div>
        <div class="text-[11px] text-slate-500">
          {{
            mediaData.externalHotlinkCount === 0
              ? '✓ ไม่มีรูปผูกกับโดเมนต้นทาง ทับเว็บเดิมได้ทันทีไม่รูปแตก'
              : 'กดปุ่มด้านบนเพื่อดูดลงเครื่องอัตโนมัติ'
          }}
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
        <div class="text-xs font-bold text-slate-500">สถานะโลโก้หลัก (csf_logo.png)</div>
        <div class="flex items-center gap-2">
          <span
            class="px-2.5 py-1 rounded-full text-xs font-bold"
            :class="
              mediaData.logoStoredLocally
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-sky-50 text-sky-700 border border-sky-200'
            "
          >
            {{ mediaData.logoStoredLocally ? 'เก็บใน /uploads/brand/csf_logo.png แล้ว' : 'รออัปโหลดหรือรันบน UAT เพื่อดูดอัตโนมัติ' }}
          </span>
        </div>
        <div class="pt-1">
          <label class="cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-700 hover:underline">
            <Upload class="w-3.5 h-3.5" />
            <span>อัปโหลดไฟล์ csf_logo.png ทับโดยตรง</span>
            <input type="file" accept="image/png,image/*" class="hidden" @change="uploadOfficialLogo" />
          </label>
        </div>
      </div>
    </div>

    <!-- Upload & Pull from URL Tools -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <!-- Upload from Computer -->
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <h3 class="text-sm font-extrabold text-slate-900">1. อัปโหลดรูปภาพ / PDF จากเครื่องคอมพิวเตอร์</h3>
        <div class="flex flex-col sm:flex-row gap-3">
          <select v-model="uploadFolder" class="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold">
            <option value="products">โฟลเดอร์สินค้า (/uploads/products)</option>
            <option value="banners">โฟลเดอร์แบนเนอร์ (/uploads/banners)</option>
            <option value="articles">โฟลเดอร์บทความ (/uploads/articles)</option>
            <option value="brand">โฟลเดอร์โลโก้แบรนด์ (/uploads/brand)</option>
            <option value="custom">โฟลเดอร์ทั่วไป (/uploads/custom)</option>
          </select>

          <label
            class="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition"
          >
            <Upload class="w-4 h-4" />
            <span>{{ uploading ? 'กำลังอัปโหลด...' : 'เลือกไฟล์รูปภาพเพื่ออัปโหลดเข้าเซิร์ฟเวอร์' }}</span>
            <input type="file" accept="image/*,.pdf" class="hidden" :disabled="uploading" @change="handleGeneralUpload" />
          </label>
        </div>
      </div>

      <!-- Pull from External URL -->
      <form @submit.prevent="handleUrlImport" class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <h3 class="text-sm font-extrabold text-slate-900">2. ดูดรูปจาก URL ต้นทางมาเก็บไว้ในเซิร์ฟเวอร์</h3>
        <div class="flex flex-col sm:flex-row gap-2">
          <input
            v-model="externalUrl"
            type="url"
            required
            placeholder="วางลิงก์รูปภาพ เช่น https://www.csf.co.th/wp-content/uploads/..."
            class="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            :disabled="importingUrl"
            class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shrink-0 inline-flex items-center gap-1.5"
          >
            <Download class="w-3.5 h-3.5" />
            <span>{{ importingUrl ? 'กำลังดูด...' : 'ดูดมาเก็บ' }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Filter & Grid -->
    <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-sm font-extrabold text-slate-900">รายการไฟล์ที่จัดเก็บในเซิร์ฟเวอร์ ({{ filteredFiles.length }})</h3>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="tab in ['all', 'brand', 'products', 'articles', 'corporate', 'banners', 'custom']"
            :key="tab"
            type="button"
            @click="selectedFolder = tab"
            class="px-3 py-1 rounded-lg text-xs font-bold transition"
            :class="selectedFolder === tab ? 'bg-csf-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          >
            {{ tab === 'all' ? 'ทั้งหมด' : tab }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div
          v-for="file in filteredFiles"
          :key="file.url"
          class="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 flex flex-col justify-between gap-2 group"
        >
          <div class="aspect-square rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
            <img :src="file.url" :alt="file.filename" class="w-full h-full object-contain p-1.5" loading="lazy" />
          </div>
          <div class="space-y-1">
            <div class="text-[11px] font-bold text-slate-800 truncate" :title="file.filename">{{ file.filename }}</div>
            <div class="text-[10px] font-mono text-slate-400 truncate">{{ file.url }}</div>
            <div class="flex items-center justify-between pt-1">
              <button
                type="button"
                @click="copyPath(file.url)"
                class="text-[11px] font-bold text-sky-700 hover:underline"
              >
                คัดลอกพาธ
              </button>
              <span class="text-[10px] text-slate-400">{{ Math.max(1, Math.round(file.size / 1024)) }} KB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download, RefreshCw, Upload } from 'lucide-vue-next'

definePageMeta({ layout: 'office' })
useHead({ title: 'คลังรูปภาพ & ดูดไฟล์ต้นทาง (Local Media Hub)' })

const { adminFetch } = useAdminAuth()
const { fetchSite } = useSiteData()

const mediaData = reactive({
  files: [] as Array<{ url: string; filename: string; folder: string; size: number; updatedAt: string }>,
  totalFiles: 0,
  logoStoredLocally: false,
  externalHotlinkCount: 0
})

const selectedFolder = ref('all')
const uploadFolder = ref('products')
const externalUrl = ref('')
const uploading = ref(false)
const importingUrl = ref(false)
const syncing = ref(false)
const notice = ref('')
const noticeError = ref(false)

const filteredFiles = computed(() => {
  if (selectedFolder.value === 'all') return mediaData.files
  return mediaData.files.filter(f => f.folder === selectedFolder.value)
})

async function loadMedia() {
  const res = await adminFetch<typeof mediaData>('/api/office/media')
  mediaData.files = res.files || []
  mediaData.totalFiles = res.totalFiles || 0
  mediaData.logoStoredLocally = Boolean(res.logoStoredLocally)
  mediaData.externalHotlinkCount = Number(res.externalHotlinkCount || 0)
}

async function handleGeneralUpload(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploading.value = true
  noticeError.value = false
  try {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', uploadFolder.value)
    const res = await adminFetch<{ url: string }>('/api/office/media/upload', { method: 'POST', body: fd })
    notice.value = `อัปโหลดไฟล์สำเร็จ เก็บไว้ที่ ${res.url}`
    await loadMedia()
  } catch (err: any) {
    noticeError.value = true
    notice.value = err?.data?.statusMessage || 'อัปโหลดไฟล์ไม่สำเร็จ'
  } finally {
    uploading.value = false
    input.value = ''
  }
}

async function uploadOfficialLogo(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploading.value = true
  noticeError.value = false
  try {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'brand')
    fd.append('exactPath', '/uploads/brand/csf_logo.png')
    await adminFetch('/api/office/media/upload', { method: 'POST', body: fd })
    await adminFetch('/api/office/settings', {
      method: 'PUT',
      body: { settings: { site_logo: '/uploads/brand/csf_logo.png' } }
    })
    await fetchSite(true)
    await loadMedia()
    notice.value = 'บันทึกโลโก้หลักไว้ที่ /uploads/brand/csf_logo.png และอัปเดตทั้งเว็บไซต์เรียบร้อยแล้ว!'
  } catch (err: any) {
    noticeError.value = true
    notice.value = err?.data?.statusMessage || 'อัปโหลดโลโก้ไม่สำเร็จ'
  } finally {
    uploading.value = false
    input.value = ''
  }
}

async function handleUrlImport() {
  if (!externalUrl.value) return
  importingUrl.value = true
  noticeError.value = false
  try {
    const res = await adminFetch<{ url: string }>('/api/office/media/import-url', {
      method: 'POST',
      body: { url: externalUrl.value, folder: uploadFolder.value }
    })
    notice.value = `ดูดรูปจากต้นทางมาเก็บที่ ${res.url} สำเร็จ!`
    externalUrl.value = ''
    await loadMedia()
  } catch (err: any) {
    noticeError.value = true
    notice.value = err?.data?.statusMessage || 'ไม่สามารถเชื่อมต่อ URL ต้นทางได้ (แนะนำให้รันบนเซิร์ฟเวอร์ UAT หรืออัปโหลดไฟล์โดยตรง)'
  } finally {
    importingUrl.value = false
  }
}

async function runOriginSync(force = false) {
  syncing.value = true
  noticeError.value = false
  try {
    const res = await adminFetch<{
      downloadedCount: number
      alreadyLocalCount: number
      dbUpdatedCount: number
      failedCount: number
    }>('/api/office/media/sync-origin', {
      method: 'POST',
      body: { forceRedownload: force }
    })
    await fetchSite(true)
    await loadMedia()
    if (res.downloadedCount > 0 || res.dbUpdatedCount > 0) {
      notice.value = `ดูดไฟล์ใหม่สำเร็จ ${res.downloadedCount} ไฟล์ (มีในเครื่องแล้ว ${res.alreadyLocalCount} ไฟล์) และอัปเดตฐานข้อมูล ${res.dbUpdatedCount} รายการ`
    } else if (res.failedCount > 0) {
      noticeError.value = true
      notice.value = `มีไฟล์ในเครื่องพร้อมใช้แล้ว ${res.alreadyLocalCount} ไฟล์ • ส่วนไฟล์เพิ่มเติมจะถูกดูดอัตโนมัติทันทีเมื่อรันบนเซิร์ฟเวอร์ uat.csf.co.th ที่เชื่อมต่ออินเทอร์เน็ตได้`
    } else {
      notice.value = `รูปภาพทั้งหมดอยู่ในเซิร์ฟเวอร์ครบถ้วนแล้ว (${res.alreadyLocalCount} ไฟล์)`
    }
  } finally {
    syncing.value = false
  }
}

async function copyPath(url: string) {
  if (navigator?.clipboard) {
    await navigator.clipboard.writeText(url)
    noticeError.value = false
    notice.value = `คัดลอกพาธ ${url} แล้ว`
  }
}

onMounted(loadMedia)
</script>
