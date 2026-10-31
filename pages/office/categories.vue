<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900">จัดการหมวดหมู่โซลูชัน (Categories)</h2>
        <p class="text-xs text-slate-500">จัดกลุ่มสินค้า Audio/Video, CCTV, IP Network และ IT Solution</p>
      </div>
      <button
        type="button"
        @click="openModal()"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-csf-navy hover:bg-sky-700 text-white text-xs font-bold transition"
      >
        <Plus class="w-4 h-4" />
        <span>เพิ่มหมวดหมู่ใหม่</span>
      </button>
    </div>

    <p v-if="errMsg" class="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">{{ errMsg }}</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between gap-4"
      >
        <div class="flex items-start gap-4">
          <img :src="cat.image_url || '/images/hero-it.jpg'" class="w-20 h-16 rounded-xl object-cover border border-slate-200 shrink-0" />
          <div class="space-y-1">
            <div class="text-xs font-mono text-sky-700 font-bold">/{{ cat.slug }} • {{ cat.product_count || 0 }} สินค้า</div>
            <h3 class="font-bold text-slate-900">{{ cat.name_th }}</h3>
            <div class="text-xs text-slate-500">{{ cat.name_en }}</div>
            <p class="text-xs text-slate-600 line-clamp-2">{{ cat.description }}</p>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button
            type="button"
            @click="openModal(cat)"
            class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
          >
            แก้ไข
          </button>
          <button
            type="button"
            @click="removeCat(cat.id)"
            class="px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-600"
          >
            ลบ
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="font-bold text-base text-slate-900">{{ editingId ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่' }}</h3>
          <button type="button" @click="modalOpen = false" class="text-slate-400">✕</button>
        </div>

        <form @submit.prevent="saveCat" class="space-y-3.5 text-sm">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อหมวดหมู่ภาษาไทย *</label>
            <input v-model="form.name_th" required type="text" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อภาษาอังกฤษ *</label>
              <input v-model="form.name_en" required type="text" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">URL Slug</label>
              <input v-model="form.slug" type="text" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">คำอธิบาย</label>
            <textarea v-model="form.description" rows="2" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"></textarea>
          </div>
          <AdminImageField
            v-model="form.image_url"
            label="รูปปกหมวดหมู่ (จัดเก็บในเซิร์ฟเวอร์)"
            folder="banners"
            placeholder="/uploads/banners/..."
          />
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">ลำดับการแสดงผล</label>
            <input v-model.number="form.sort_order" type="number" class="w-32 px-3 py-2 rounded-xl border border-slate-300 text-sm" />
          </div>
          <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" @click="modalOpen = false" class="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold">
              ยกเลิก
            </button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-csf-navy hover:bg-sky-700 text-white text-xs font-bold">
              บันทึก
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
useHead({ title: 'จัดการหมวดหมู่ (Admin Categories)' })

const { adminFetch } = useAdminAuth()
const categories = ref<any[]>([])
const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const errMsg = ref('')

const form = reactive({
  name_th: '',
  name_en: '',
  slug: '',
  description: '',
  image_url: '/images/hero-it.jpg',
  sort_order: 1,
  is_active: true
})

async function loadCategories() {
  const res = await adminFetch('/api/office/categories')
  categories.value = res.categories || []
}

function openModal(item?: any) {
  errMsg.value = ''
  if (item) {
    editingId.value = item.id
    Object.assign(form, {
      name_th: item.name_th,
      name_en: item.name_en,
      slug: item.slug,
      description: item.description || '',
      image_url: item.image_url || '/images/hero-it.jpg',
      sort_order: item.sort_order || 1,
      is_active: Boolean(item.is_active)
    })
  } else {
    editingId.value = null
    Object.assign(form, {
      name_th: '',
      name_en: '',
      slug: '',
      description: '',
      image_url: '/images/hero-it.jpg',
      sort_order: categories.value.length + 1,
      is_active: true
    })
  }
  modalOpen.value = true
}

async function saveCat() {
  if (editingId.value) {
    await adminFetch(`/api/office/categories/${editingId.value}`, { method: 'PUT', body: form })
  } else {
    await adminFetch('/api/office/categories', { method: 'POST', body: form })
  }
  modalOpen.value = false
  await loadCategories()
}

async function removeCat(id: number) {
  errMsg.value = ''
  try {
    await adminFetch(`/api/office/categories/${id}`, { method: 'DELETE' })
    await loadCategories()
  } catch (err: any) {
    errMsg.value = err?.data?.statusMessage || 'ลบหมวดหมู่ไม่สำเร็จ'
  }
}

onMounted(loadCategories)
</script>
