<template>
  <article
    class="group bg-white rounded-2xl border border-slate-200/90 hover:border-sky-300 shadow-sm hover:shadow-xl hover:shadow-sky-950/5 transition-all duration-300 flex flex-col overflow-hidden"
  >
    <!-- Product Image Area -->
    <NuxtLink :to="`/products/${product.slug}`" class="relative aspect-[16/11] bg-slate-100 overflow-hidden block">
      <img
        :src="product.image_url || '/images/prod-speaker.jpg'"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
        <span class="px-2.5 py-1 rounded-md bg-csf-navy/90 backdrop-blur-sm text-sky-300 font-mono text-[11px] font-semibold">
          {{ product.sku }}
        </span>
        <span
          v-if="product.is_featured"
          class="px-2 py-1 rounded-md bg-amber-500/95 text-white text-[11px] font-bold"
        >
          แนะนำ
        </span>
      </div>
      <div class="absolute bottom-3 right-3">
        <span class="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-emerald-700 text-[11px] font-semibold shadow-sm border border-emerald-100">
          {{ product.stock_status || 'พร้อมส่ง' }}
        </span>
      </div>
    </NuxtLink>

    <!-- Content -->
    <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2 text-xs">
          <span class="font-semibold text-sky-700 truncate">
            {{ product.category_name_en || product.category_name_th || 'Enterprise Solution' }}
          </span>
          <span class="text-slate-400 font-medium shrink-0">{{ product.brand }}</span>
        </div>

        <NuxtLink :to="`/products/${product.slug}`" class="block">
          <h3 class="font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2 leading-snug">
            {{ product.name }}
          </h3>
        </NuxtLink>

        <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {{ product.subtitle || product.description }}
        </p>

        <!-- Key Spec Highlights -->
        <ul v-if="product.specs?.length" class="pt-1 space-y-1">
          <li
            v-for="(spec, idx) in product.specs.slice(0, 2)"
            :key="idx"
            class="text-[11px] text-slate-600 flex items-start gap-1.5 line-clamp-1"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
            <span class="truncate">{{ spec }}</span>
          </li>
        </ul>
      </div>

      <div class="pt-3 border-t border-slate-100 space-y-3">
        <div class="flex items-baseline justify-between gap-2">
          <span class="text-xs text-slate-400">ราคาองค์กร</span>
          <span class="text-sm font-bold text-slate-900">{{ product.price_display }}</span>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <NuxtLink
            :to="`/products/${product.slug}`"
            class="py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold text-center transition"
          >
            ดูสเปกละเอียด
          </NuxtLink>
          <button
            type="button"
            @click="openQuoteModal({ id: product.id, sku: product.sku, name: product.name })"
            class="py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold text-center transition"
          >
            ขอใบเสนอราคา
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  product: any
}>()

const { openQuoteModal } = useSiteData()
</script>
