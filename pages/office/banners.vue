<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900">จัดการแบนเนอร์สไลด์หน้าแรก (Hero Banners)</h2>
        <p class="text-xs text-slate-500">ปรับแต่งภาพสไลด์ หัวข้อ ปุ่มลิงก์ และลำดับการแสดงผลบนหน้าแรก csf.co.th</p>
      </div>
      <button
        type="button"
        @click="openModal()"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-csf-navy hover:bg-sky-700 text-white text-xs font-bold transition"
      >
        <Plus class="w-4 h-4" />
        <span>เพิ่มสไลด์แบนเนอร์ใหม่</span>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div
        v-for="b in banners"
        :key="b.id"
        class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col"
      >
        <div class="aspect-[16/8] bg-slate-900 relative overflow-hidden">
          <img :src="b.image_url" :alt="b.title" class="w-full h-full object-cover opacity-85" />
          <div class="absolute top-3 left-3 flex gap-2">
            <span class="px-2.5 py-1 rounded bg-slate-950/80 text-white font-mono text-xs font-bold">ลำดับ #{{ b.sort_order }}</span>
            <span
              class="px-2.5 py-1 rounded text-xs font-bold"
              :class="b.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-200'"
            >
              {{ b.is_active ? 'แสดงผลอยู่' : 'ซ่อน' }}
            </span>
          </div>
        </div>
        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div class="space-y-1">
            <div class="text-[11px] font-bold text-sky-600 uppercase">{{ b.badge }}</div>
            <h3 class="font-bold text-slate-900 text-base">{{ b.title }}</h3>
            <p class="text-xs text-slate-600 line-clamp-2">{{ b.subtitle }}</p>
          </div>
          <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              @click="openModal(b)"
              class="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
            >
              แก้ไข
            </button>
            <button
              type="button"
              @click="removeBanner(b.id)"
              class="px-3.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-600"
            >
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl my-8">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="font-bold text-base text-slate-900">{{ editingId ? 'แก้ไขสไลด์แบนเนอร์' : 'เพิ่มสไลด์แบนเนอร์ใหม่' }}</h3>
          <button type="button" @click="modalOpen = false" class="text-slate-400 hover:text-slate-700">✕</button>
        </div>

        <form @submit.prevent="saveBanner" class="space-y-3.5 text-sm">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-slate-700 mb-1">ป้ายกำกับด้านบน (Badge)</label>
              <input v-model="form.badge" type="text" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ลำดับการแสดง</label>
              <input v-model.number="form.sort_order" type="number" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">หัวข้อหลัก (Title) *</label>
            <input v-model="form.title" required type="text" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">หัวข้อรอง (Subtitle)</label>
            <input v-model="form.subtitle" type="text" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">คำอธิบาย</label>
            <textarea v-model="form.description" rows="2" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"></textarea>
          </div>

          <AdminImageField
            v-model="form.image_url"
            label="รูปภาพพื้นหลังสไลด์ (อัปโหลดหรือดูดเก็บในเซิร์ฟเวอร์)"
            folder="banners"
            placeholder="/uploads/banners/... หรือวาง URL เพื่อดูดเก็บในเครื่อง"
          />

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ข้อความปุ่มหลัก</label>
              <input v-model="form.cta_label" type="text" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ลิงก์ปุ่มหลัก</label>
              <input v-model="form.cta_link" type="text" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono" />
            </div>
          </div>

          <label class="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 pt-1">
            <input v-model="form.is_active" type="checkbox" class="rounded text-sky-600" />
            <span>เปิดแสดงผลสไลด์นี้บนหน้าแรก</span>
          </label>

          <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" @click="modalOpen = false" class="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold">
              ยกเลิก
            </button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-csf-navy hover:bg-sky-700 text-white text-xs font-bold">
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

definePageMeta({ layout: 'office' })
useHead({ title: 'จัดการแบนเนอร์สไลด์ (Admin Banners)' })

const { adminFetch } = useAdminAuth()
const banners = ref<any[]>([])
const modalOpen = ref(false)
const editingId = ref<number | null>(null)

const form = reactive({
  badge: 'CSF TECHNOLOGY TOUCH',
  title: '',
  subtitle: '',
  description: '',
  cta_label: 'ดูสินค้าและโซลูชัน',
  cta_link: '/products',
  secondary_label: 'ขอใบเสนอราคา',
  secondary_link: '/contact',
  image_url: '/images/hero-it.jpg',
  sort_order: 1,
  is_active: true
})

async function loadBanners() {
  const res = await adminFetch('/api/office/banners')
  banners.value = res.banners || []
}

function openModal(item?: any) {
  if (item) {
    editingId.value = item.id
    Object.assign(form, {
      badge: item.badge,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description || '',
      cta_label: item.cta_label,
      cta_link: item.cta_link,
      secondary_label: item.secondary_label,
      secondary_link: item.secondary_link,
      image_url: item.image_url,
      sort_order: item.sort_order,
      is_active: Boolean(item.is_active)
    })
  } else {
    editingId.value = null
    Object.assign(form, {
      badge: 'CSF TECHNOLOGY TOUCH',
      title: '',
      subtitle: '',
      description: '',
      cta_label: 'ดูสินค้าและโซลูชัน',
      cta_link: '/products',
      secondary_label: 'ขอใบเสนอราคา',
      secondary_link: '/contact',
      image_url: '/images/hero-it.jpg',
      sort_order: banners.value.length + 1,
      is_active: true
    })
  }
  modalOpen.value = true
}

async function saveBanner() {
  if (editingId.value) {
    await adminFetch(`/api/office/banners/${editingId.value}`, { method: 'PUT', body: form })
  } else {
    await adminFetch('/api/office/banners', { method: 'POST', body: form })
  }
  modalOpen.value = false
  await loadBanners()
}

async function removeBanner(id: number) {
  await adminFetch(`/api/office/banners/${id}`, { method: 'DELETE' })
  await loadBanners()
}

onMounted(loadBanners)
</script>
