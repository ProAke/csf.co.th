<template>
  <div>
    <!-- Header -->
    <section class="bg-csf-navy text-white py-12 lg:py-16 relative overflow-hidden">
      <div class="tech-grid-bg absolute inset-0 pointer-events-none"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span class="text-xs font-bold uppercase tracking-widest text-sky-400">CSF PRODUCT CATALOG</span>
          <h1 class="mt-1.5 text-3xl sm:text-4xl font-extrabold">สินค้าและโซลูชันเทคโนโลยี</h1>
          <p class="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl">
            ค้นหาอุปกรณ์ Audio/Video, ระบบกล้องวงจรปิด CCTV, เครือข่าย IP Network และโซลูชัน IT พร้อมขอใบเสนอราคาสำหรับองค์กรได้ทันที
          </p>
        </div>

        <!-- Search Box -->
        <div class="w-full md:w-80">
          <div class="relative">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              type="search"
              placeholder="ค้นหารหัส SKU เช่น DSP501, NVR..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Filter & Grid -->
    <section class="py-12 bg-slate-50 min-h-[60vh]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <!-- Category Pills -->
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            @click="selectCategory('all')"
            class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition"
            :class="
              selectedCategory === 'all'
                ? 'bg-csf-navy text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300'
            "
          >
            ทั้งหมด ({{ totalAllCount }})
          </button>

          <button
            v-for="cat in categories"
            :key="cat.slug"
            type="button"
            @click="selectCategory(cat.slug)"
            class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition"
            :class="
              selectedCategory === cat.slug
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300'
            "
          >
            {{ cat.name_th }} ({{ cat.product_count || 0 }})
          </button>
        </div>

        <!-- Products Grid -->
        <div v-if="pending" class="py-16 text-center text-sm text-slate-500">กำลังโหลดข้อมูลสินค้า...</div>

        <div v-else-if="products.length === 0" class="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <PackageSearch class="w-12 h-12 text-slate-400 mx-auto" />
          <h3 class="text-lg font-bold text-slate-900">ไม่พบรายการสินค้าที่ตรงกับคำค้นหา</h3>
          <p class="text-sm text-slate-500 max-w-md mx-auto">
            หากต้องการสอบถามรุ่นสินค้าพิเศษหรืออะไหล่เฉพาะทางที่ยังไม่ได้แสดงบนหน้าเว็บ สามารถทัก LINE OA หรือส่งรายการให้ฝ่ายจัดหาสินค้าของ CSF ได้ทันที
          </p>
          <div class="flex justify-center gap-3 pt-2">
            <button
              type="button"
              @click="resetFilters"
              class="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              ล้างตัวกรองทั้งหมด
            </button>
            <button
              type="button"
              @click="openQuoteModal(null)"
              class="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700"
            >
              ส่งรายการให้ฝ่ายขายจัดหา
            </button>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ProductCard v-for="prod in products" :key="prod.id" :product="prod" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { PackageSearch, Search } from 'lucide-vue-next'

useHead({ title: 'สินค้าและโซลูชันทั้งหมด (Products & Solutions)' })

const route = useRoute()
const router = useRouter()
const { openQuoteModal } = useSiteData()

const selectedCategory = ref<string>(String(route.query.category || 'all'))
const searchQuery = ref<string>(String(route.query.q || ''))

watch(
  () => route.query.category,
  val => {
    selectedCategory.value = String(val || 'all')
  }
)

const { data, pending } = await useFetch('/api/products', {
  query: computed(() => ({
    category: selectedCategory.value,
    q: searchQuery.value
  }))
})

const products = computed(() => data.value?.products || [])
const categories = computed(() => data.value?.categories || [])
const totalAllCount = computed(() =>
  categories.value.reduce((acc: number, c: any) => acc + Number(c.product_count || 0), 0)
)

function selectCategory(slug: string) {
  selectedCategory.value = slug
  router.replace({ query: slug === 'all' ? {} : { category: slug } })
}

function resetFilters() {
  selectedCategory.value = 'all'
  searchQuery.value = ''
  router.replace({ query: {} })
}
</script>
