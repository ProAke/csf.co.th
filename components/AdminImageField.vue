<template>
  <div class="space-y-2.5">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <label class="block text-xs font-bold text-slate-700">{{ label }}</label>
      <span
        v-if="modelValue"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
        :class="
          isLocalPath
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        "
      >
        <CheckCircle2 v-if="isLocalPath" class="w-3 h-3" />
        <AlertTriangle v-else class="w-3 h-3" />
        <span>{{ isLocalPath ? 'เก็บในเซิร์ฟเวอร์แล้ว (Local)' : 'ลิงก์ภายนอก — กดดูดเก็บในเครื่องได้' }}</span>
      </span>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 items-start">
      <!-- Preview Thumbnail (Pure White Background) -->
      <div
        class="w-24 h-20 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0"
      >
        <img
          v-if="modelValue && !previewBroken"
          :src="modelValue"
          alt="Preview"
          class="w-full h-full object-contain p-1"
          @error="previewBroken = true"
        />
        <ImageIcon v-else class="w-6 h-6 text-slate-300" />
      </div>

      <!-- Controls -->
      <div class="flex-1 w-full space-y-2">
        <div class="flex gap-2">
          <input
            :value="modelValue"
            @input="onTextInput(($event.target as HTMLInputElement).value)"
            type="text"
            :placeholder="placeholder"
            class="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-sky-500 outline-none"
          />
          <button
            v-if="modelValue && !isLocalPath"
            type="button"
            :disabled="busy"
            @click="pullExternalToLocal"
            class="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shrink-0 inline-flex items-center gap-1.5 transition"
          >
            <Download class="w-3.5 h-3.5" />
            <span>{{ busy ? 'กำลังดูดไฟล์...' : 'ดูดเก็บในเครื่อง' }}</span>
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <label
            class="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold transition"
          >
            <Upload class="w-3.5 h-3.5" />
            <span>{{ busy ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปจากเครื่อง' }}</span>
            <input
              type="file"
              accept="image/*,.pdf"
              class="hidden"
              :disabled="busy"
              @change="handleFileSelect"
            />
          </label>

          <button
            type="button"
            @click="openLibrary"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <FolderOpen class="w-3.5 h-3.5" />
            <span>เลือกจากคลังในเซิร์ฟเวอร์</span>
          </button>
        </div>

        <p v-if="statusMsg" class="text-[11px] font-medium" :class="statusError ? 'text-red-600' : 'text-emerald-600'">
          {{ statusMsg }}
        </p>
      </div>
    </div>

    <!-- Local Media Picker Modal -->
    <div
      v-if="pickerOpen"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="pickerOpen = false"
    >
      <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[82vh] flex flex-col overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h4 class="text-sm font-extrabold text-slate-900">เลือกรูปภาพที่จัดเก็บในเซิร์ฟเวอร์ (/uploads &amp; /images)</h4>
            <p class="text-xs text-slate-500">ไฟล์ทั้งหมดเก็บอยู่ในเครื่อง ไม่ผูกกับเว็บต้นทาง พร้อมสำหรับขึ้น uat.csf.co.th</p>
          </div>
          <button type="button" @click="pickerOpen = false" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
          <button
            v-for="item in libraryItems"
            :key="item.url"
            type="button"
            @click="selectLibraryItem(item.url)"
            class="group rounded-xl border border-slate-200 hover:border-sky-500 p-2 text-left transition bg-slate-50/60 hover:bg-sky-50/40"
          >
            <div class="aspect-square rounded-lg bg-white border border-slate-100 overflow-hidden flex items-center justify-center mb-1.5">
              <img :src="item.url" :alt="item.filename" class="w-full h-full object-contain p-1" loading="lazy" />
            </div>
            <div class="text-[11px] font-semibold text-slate-700 truncate">{{ item.filename }}</div>
            <div class="text-[10px] text-slate-400 font-mono truncate">{{ item.folder }}</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FolderOpen,
  Image as ImageIcon,
  Upload,
  X
} from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    folder?: string
    exactPath?: string
    placeholder?: string
  }>(),
  {
    label: 'รูปภาพประกอบ (จัดเก็บในเซิร์ฟเวอร์)',
    folder: 'custom',
    exactPath: '',
    placeholder: '/uploads/products/...'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const { adminFetch } = useAdminAuth()

const busy = ref(false)
const statusMsg = ref('')
const statusError = ref(false)
const previewBroken = ref(false)
const pickerOpen = ref(false)
const libraryItems = ref<Array<{ url: string; filename: string; folder: string }>>([])

const BUILTIN_IMAGES = [
  { url: '/images/hero-av.jpg', filename: 'hero-av.jpg', folder: 'images' },
  { url: '/images/hero-cctv.jpg', filename: 'hero-cctv.jpg', folder: 'images' },
  { url: '/images/hero-network.jpg', filename: 'hero-network.jpg', folder: 'images' },
  { url: '/images/hero-it.jpg', filename: 'hero-it.jpg', folder: 'images' },
  { url: '/images/prod-speaker.jpg', filename: 'prod-speaker.jpg', folder: 'images' },
  { url: '/images/prod-amplifier.jpg', filename: 'prod-amplifier.jpg', folder: 'images' },
  { url: '/images/prod-nvr.jpg', filename: 'prod-nvr.jpg', folder: 'images' },
  { url: '/images/prod-dome-cam.jpg', filename: 'prod-dome-cam.jpg', folder: 'images' },
  { url: '/images/prod-connector.jpg', filename: 'prod-connector.jpg', folder: 'images' }
]

const isLocalPath = computed(() => {
  const v = String(props.modelValue || '').trim()
  return v.startsWith('/') && !v.startsWith('//')
})

watch(
  () => props.modelValue,
  () => {
    previewBroken.value = false
  }
)

function onTextInput(val: string) {
  statusMsg.value = ''
  emit('update:modelValue', val)
}

async function handleFileSelect(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  busy.value = true
  statusMsg.value = ''
  statusError.value = false

  try {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', props.folder)
    if (props.exactPath) {
      fd.append('exactPath', props.exactPath)
    }

    const res = await adminFetch<{ ok: boolean; url: string }>('/api/office/media/upload', {
      method: 'POST',
      body: fd
    })

    emit('update:modelValue', res.url)
    statusMsg.value = `อัปโหลดเก็บในเซิร์ฟเวอร์เรียบร้อย (${res.url})`
  } catch (err: any) {
    statusError.value = true
    statusMsg.value = err?.data?.statusMessage || 'อัปโหลดรูปภาพไม่สำเร็จ'
  } finally {
    busy.value = false
    input.value = ''
  }
}

async function pullExternalToLocal() {
  if (!props.modelValue) return
  busy.value = true
  statusMsg.value = ''
  statusError.value = false

  try {
    const res = await adminFetch<{ ok: boolean; url: string }>('/api/office/media/import-url', {
      method: 'POST',
      body: {
        url: props.modelValue,
        folder: props.folder,
        exactPath: props.exactPath || undefined
      }
    })
    emit('update:modelValue', res.url)
    statusMsg.value = `ดูดไฟล์มาเก็บไว้ที่ ${res.url} เรียบร้อยแล้ว`
  } catch (err: any) {
    statusError.value = true
    statusMsg.value = err?.data?.statusMessage || 'ไม่สามารถดูดรูปจาก URL ต้นทางได้ กรุณาอัปโหลดไฟล์จากเครื่อง'
  } finally {
    busy.value = false
  }
}

async function openLibrary() {
  pickerOpen.value = true
  try {
    const res = await adminFetch<{ files: Array<{ url: string; filename: string; folder: string }> }>('/api/office/media')
    libraryItems.value = [...(res.files || []), ...BUILTIN_IMAGES]
  } catch {
    libraryItems.value = [...BUILTIN_IMAGES]
  }
}

function selectLibraryItem(url: string) {
  emit('update:modelValue', url)
  pickerOpen.value = false
  statusError.value = false
  statusMsg.value = `เลือกรูปในเซิร์ฟเวอร์: ${url}`
}
</script>
