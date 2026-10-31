<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900">จัดการสินค้าและสเปกเทคนิค (Products Catalog)</h2>
        <p class="text-xs text-slate-500">เพิ่ม แก้ไข ลบสินค้า และส่งการ์ดสินค้าเข้า LINE OA หรือโพสต์ขึ้น Facebook ได้ทันที</p>
      </div>
      <button
        type="button"
        @click="openModal()"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-csf-navy hover:bg-sky-700 text-white text-xs font-bold transition"
      >
        <Plus class="w-4 h-4" />
        <span>เพิ่มสินค้าใหม่</span>
      </button>
    </div>

    <div v-if="toastMsg" class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between">
      <span>{{ toastMsg }}</span>
      <button type="button" @click="toastMsg = ''" class="text-emerald-600 font-bold">✕</button>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3">
      <input
        v-model="filterText"
        type="search"
        placeholder="ค้นหารหัส SKU หรือชื่อสินค้า..."
        class="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-sky-500"
      />
      <select v-model="filterCat" class="px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white">
        <option value="all">ทุกหมวดหมู่</option>
        <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.name_th }}</option>
      </select>
    </div>

    <!-- Products Table -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 uppercase">
            <th class="py-3.5 px-4">สินค้า / รหัส SKU</th>
            <th class="py-3.5 px-4">หมวดหมู่</th>
            <th class="py-3.5 px-4">ราคาแสดงผล</th>
            <th class="py-3.5 px-4">สถานะ</th>
            <th class="py-3.5 px-4 text-right">จัดการ / แชร์โซเชียล</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="p in filteredProducts" :key="p.id" class="hover:bg-slate-50/80">
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-3">
                <img :src="p.image_url || '/images/prod-speaker.jpg'" class="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-bold text-sky-700">{{ p.sku }}</span>
                    <span v-if="p.is_featured" class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">แนะนำ</span>
                  </div>
                  <div class="font-bold text-slate-900 line-clamp-1">{{ p.name }}</div>
                  <div class="text-xs text-slate-400">{{ p.brand }}</div>
                </div>
              </div>
            </td>
            <td class="py-3.5 px-4 text-xs font-semibold text-slate-600">{{ p.category_name_th }}</td>
            <td class="py-3.5 px-4 text-xs font-bold text-slate-800">{{ p.price_display }}</td>
            <td class="py-3.5 px-4">
              <span
                class="px-2.5 py-1 rounded-full text-[11px] font-bold"
                :class="p.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
              >
                {{ p.is_active ? p.stock_status : 'ซ่อนชั่วคราว' }}
              </span>
            </td>
            <td class="py-3.5 px-4 text-right">
              <div class="inline-flex flex-wrap justify-end gap-1.5">
                <button
                  type="button"
                  @click="quickBroadcast(p, 'line_oa')"
                  title="Broadcast Flex Card เข้า LINE OA"
                  class="px-2.5 py-1.5 rounded-lg bg-[#06C755]/15 hover:bg-[#06C755] text-emerald-800 hover:text-white text-[11px] font-bold transition"
                >
                  LINE Flex
                </button>
                <button
                  type="button"
                  @click="quickBroadcast(p, 'facebook')"
                  title="โพสต์ขึ้นเพจ Facebook"
                  class="px-2.5 py-1.5 rounded-lg bg-[#1877F2]/15 hover:bg-[#1877F2] text-blue-800 hover:text-white text-[11px] font-bold transition"
                >
                  FB Post
                </button>
                <button
                  type="button"
                  @click="openModal(p)"
                  class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                >
                  แก้ไข
                </button>
                <button
                  type="button"
                  @click="removeProduct(p.id)"
                  class="px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-600"
                >
                  ลบ
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Product Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="font-bold text-base text-slate-900">{{ editingId ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มรายการสินค้าใหม่' }}</h3>
          <button type="button" @click="modalOpen = false" class="text-slate-400 hover:text-slate-700">✕</button>
        </div>

        <form @submit.prevent="saveProduct" class="space-y-3.5 text-sm">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">รหัสสินค้า (SKU) *</label>
              <input v-model="form.sku" required type="text" placeholder="เช่น DSP501" class="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">หมวดหมู่ *</label>
              <select v-model.number="form.category_id" class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm">
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name_th }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">แบรนด์ผู้ผลิต</label>
              <input v-model="form.brand" type="text" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อสินค้าเต็ม *</label>
            <input v-model="form.name" required type="text" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">คำโปรยสั้น (Subtitle)</label>
            <input v-model="form.subtitle" type="text" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ข้อความแสดงราคา</label>
              <input v-model="form.price_display" type="text" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">สถานะสต็อก</label>
              <input v-model="form.stock_status" type="text" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
            </div>
          </div>

          <AdminImageField
            v-model="form.image_url"
            label="รูปภาพสินค้า (อัปโหลดหรือดูดเก็บในเซิร์ฟเวอร์ ไม่ลิงก์ไปเว็บต้นทาง)"
            folder="products"
            placeholder="/uploads/products/... หรือวาง URL รูปเพื่อดูดมาเก็บ"
          />

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">รายละเอียดสินค้า</label>
            <textarea v-model="form.description" rows="2" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"></textarea>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">คุณสมบัติทางเทคนิค (บรรทัดละ 1 ข้อ)</label>
            <textarea
              v-model="form.specs_text"
              rows="4"
              placeholder="รองรับระบบสาย 100V/70V&#10;ดอกลำโพงขนาด 6.5 นิ้ว"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
            ></textarea>
          </div>

          <div class="flex flex-wrap gap-6 pt-1">
            <label class="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input v-model="form.is_featured" type="checkbox" class="rounded text-sky-600" />
              <span>แสดงเป็นสินค้าเด่นหน้าแรก (Featured)</span>
            </label>
            <label class="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input v-model="form.is_active" type="checkbox" class="rounded text-sky-600" />
              <span>เปิดแสดงผลบนหน้าเว็บไซต์</span>
            </label>
          </div>

          <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" @click="modalOpen = false" class="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold">
              ยกเลิก
            </button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-csf-navy hover:bg-sky-700 text-white text-xs font-bold">
              บันทึกสินค้า
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
useHead({ title: 'จัดการสินค้า (Admin Products)' })

const { adminFetch } = useAdminAuth()
const products = ref<any[]>([])
const categories = ref<any[]>([])
const filterText = ref('')
const filterCat = ref('all')
const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const toastMsg = ref('')

const form = reactive({
  sku: '',
  slug: '',
  name: '',
  subtitle: '',
  brand: 'DSPPA Audio',
  category_id: 1,
  description: '',
  specs_text: '',
  price_display: 'ขอใบเสนอราคา (B2B)',
  image_url: '/images/prod-speaker.jpg',
  stock_status: 'มีสินค้าพร้อมส่ง',
  is_featured: false,
  is_active: true
})

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    if (filterCat.value !== 'all' && String(p.category_id) !== filterCat.value) return false
    if (filterText.value) {
      const q = filterText.value.toLowerCase()
      return (
        String(p.sku).toLowerCase().includes(q) ||
        String(p.name).toLowerCase().includes(q) ||
        String(p.brand).toLowerCase().includes(q)
      )
    }
    return true
  })
})

async function loadAll() {
  const [pRes, cRes] = await Promise.all([
    adminFetch('/api/office/products'),
    adminFetch('/api/office/categories')
  ])
  products.value = pRes.products || []
  categories.value = cRes.categories || []
}

function openModal(item?: any) {
  if (item) {
    editingId.value = item.id
    Object.assign(form, {
      sku: item.sku,
      slug: item.slug,
      name: item.name,
      subtitle: item.subtitle || '',
      brand: item.brand || '',
      category_id: item.category_id,
      description: item.description || '',
      specs_text: Array.isArray(item.specs) ? item.specs.join('\n') : '',
      price_display: item.price_display || 'ขอใบเสนอราคา (B2B)',
      image_url: item.image_url || '/images/prod-speaker.jpg',
      stock_status: item.stock_status || 'มีสินค้าพร้อมส่ง',
      is_featured: Boolean(item.is_featured),
      is_active: Boolean(item.is_active)
    })
  } else {
    editingId.value = null
    Object.assign(form, {
      sku: '',
      slug: '',
      name: '',
      subtitle: '',
      brand: 'CSF Partner Brand',
      category_id: categories.value[0]?.id || 1,
      description: '',
      specs_text: '',
      price_display: 'ขอใบเสนอราคา (B2B)',
      image_url: '/images/prod-speaker.jpg',
      stock_status: 'มีสินค้าพร้อมส่ง',
      is_featured: true,
      is_active: true
    })
  }
  modalOpen.value = true
}

async function saveProduct() {
  if (editingId.value) {
    await adminFetch(`/api/office/products/${editingId.value}`, { method: 'PUT', body: form })
    toastMsg.value = `อัปเดตสินค้า ${form.sku} เรียบร้อยแล้ว`
  } else {
    await adminFetch('/api/office/products', { method: 'POST', body: form })
    toastMsg.value = `เพิ่มสินค้าใหม่ ${form.sku} เรียบร้อยแล้ว`
  }
  modalOpen.value = false
  await loadAll()
}

async function removeProduct(id: number) {
  await adminFetch(`/api/office/products/${id}`, { method: 'DELETE' })
  toastMsg.value = 'ลบรายการสินค้าเรียบร้อยแล้ว'
  await loadAll()
}

async function quickBroadcast(prod: any, platform: 'line_oa' | 'facebook') {
  const res = await adminFetch<{ ok: boolean; detail: string }>('/api/office/integrations/broadcast', {
    method: 'POST',
    body: {
      platform,
      product_id: prod.id
    }
  })
  toastMsg.value = `[${prod.sku}] ${res.detail}`
}

onMounted(loadAll)
</script>
