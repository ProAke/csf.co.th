<template>
  <div v-if="product" class="bg-slate-50 py-10 lg:py-14">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto">
        <NuxtLink to="/" class="hover:text-sky-700 shrink-0">หน้าแรก</NuxtLink>
        <span>/</span>
        <NuxtLink to="/products" class="hover:text-sky-700 shrink-0">สินค้าและโซลูชัน</NuxtLink>
        <span v-if="product.category_slug">/</span>
        <NuxtLink
          v-if="product.category_slug"
          :to="`/products?category=${product.category_slug}`"
          class="hover:text-sky-700 shrink-0"
        >
          {{ product.category_name_th }}
        </NuxtLink>
        <span>/</span>
        <span class="font-mono font-semibold text-slate-800 truncate">{{ product.sku }}</span>
      </nav>

      <!-- Main Product Card -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <!-- Image Column -->
        <div class="lg:col-span-5 bg-slate-100 p-6 sm:p-10 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200">
          <img
            :src="product.image_url || '/images/prod-speaker.jpg'"
            :alt="product.name"
            class="w-full max-h-96 object-cover rounded-2xl shadow-md"
          />
        </div>

        <!-- Specs & Actions Column -->
        <div class="lg:col-span-7 p-6 sm:p-10 space-y-6">
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="px-3 py-1 rounded-lg bg-csf-navy text-sky-300 font-mono text-xs font-bold">
              SKU: {{ product.sku }}
            </span>
            <span class="px-3 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold">
              {{ product.brand }}
            </span>
            <span class="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
              {{ product.stock_status }}
            </span>
          </div>

          <div class="space-y-2">
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">{{ product.name }}</h1>
            <p class="text-sm sm:text-base font-medium text-slate-600">{{ product.subtitle }}</p>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="text-xs text-slate-500">ราคาจัดจำหน่าย / โครงการองค์กร</div>
              <div class="text-xl font-extrabold text-sky-700">{{ product.price_display }}</div>
            </div>
            <div class="text-xs text-slate-500">
              ออกใบกำกับภาษีเต็มรูปแบบในนาม<br />
              <strong class="text-slate-700">บริษัท ซีเอสเอฟ จำกัด</strong>
            </div>
          </div>

          <div class="space-y-2">
            <h2 class="text-sm font-bold uppercase tracking-wider text-slate-900">รายละเอียดผลิตภัณฑ์</h2>
            <p class="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{{ product.description }}</p>
          </div>

          <div v-if="product.specs?.length" class="space-y-2.5">
            <h2 class="text-sm font-bold uppercase tracking-wider text-slate-900">คุณสมบัติทางเทคนิค (Technical Specifications)</h2>
            <ul class="grid grid-cols-1 gap-2">
              <li
                v-for="(spec, idx) in product.specs"
                :key="idx"
                class="flex items-start gap-2.5 text-sm text-slate-700 bg-slate-50/80 px-3.5 py-2 rounded-xl border border-slate-100"
              >
                <CheckCircle2 class="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>{{ spec }}</span>
              </li>
            </ul>
          </div>

          <!-- B2B & Social Connect CTA Bar -->
          <div class="pt-4 border-t border-slate-200 flex flex-wrap gap-3">
            <button
              type="button"
              @click="openQuoteModal({ id: product.id, sku: product.sku, name: product.name })"
              class="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-csf-navy hover:bg-sky-700 text-white font-bold text-sm transition shadow-sm"
            >
              <FileText class="w-4 h-4 text-sky-300" />
              <span>ขอใบเสนอราคารุ่น {{ product.sku }}</span>
            </button>

            <button
              type="button"
              @click="openLineModal()"
              class="inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-sm transition"
            >
              <MessageCircle class="w-4 h-4" />
              <span>ถามทาง LINE OA</span>
            </button>

            <a
              :href="facebookShareUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border border-[#1877F2]/30 bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white font-semibold text-sm transition"
            >
              <Share2 class="w-4 h-4" />
              <span>แชร์ Facebook</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div v-if="related.length" class="space-y-6">
        <h2 class="text-xl font-extrabold text-slate-900">สินค้าที่เกี่ยวข้องในกลุ่มเดียวกัน</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProductCard v-for="rel in related" :key="rel.id" :product="rel" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2, FileText, MessageCircle, Share2 } from 'lucide-vue-next'

const route = useRoute()
const config = useRuntimeConfig()
const { openQuoteModal, openLineModal } = useSiteData()

const { data } = await useFetch(`/api/products/${route.params.slug}`)
const product = computed(() => data.value?.product || null)
const related = computed(() => data.value?.related || [])

useHead(() => ({
  title: product.value ? `${product.value.sku} — ${product.value.name}` : 'รายละเอียดสินค้า'
}))

const facebookShareUrl = computed(() => {
  const pageUrl = `${config.public.siteUrl || 'https://uat.csf.co.th'}/products/${route.params.slug}`
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`
})
</script>
