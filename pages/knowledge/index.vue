<template>
  <div>
    <section class="bg-csf-navy text-white py-12 lg:py-16 relative overflow-hidden">
      <div class="tech-grid-bg absolute inset-0 pointer-events-none"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <span class="text-xs font-bold uppercase tracking-widest text-sky-400">TECHNOLOGY KNOWLEDGE &amp; PRODUCT SUPPORT</span>
        <h1 class="mt-1.5 text-3xl sm:text-4xl font-extrabold">คลังความรู้เทคโนโลยีและบริการซัพพอร์ต</h1>
        <p class="mt-2 text-slate-300 max-w-2xl text-sm sm:text-base">
          บทความแนะนำการเลือกสเปกอุปกรณ์ แนวทางการดูแลรักษาระบบเสียงห้องเรียน กล้องวงจรปิด และระบบเครือข่ายสำหรับองค์กร
        </p>
      </div>
    </section>

    <section class="py-12 bg-slate-50 min-h-[55vh]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in ['all', 'Product Support', 'Technology Knowledge']"
            :key="cat"
            type="button"
            @click="selectedCat = cat"
            class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition"
            :class="selectedCat === cat ? 'bg-csf-navy text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-sky-300'"
          >
            {{ cat === 'all' ? 'บทความทั้งหมด' : cat }}
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="art in articles"
            :key="art.id"
            :to="`/knowledge/${art.slug}`"
            class="group bg-white rounded-2xl border border-slate-200 hover:border-sky-300 overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col"
          >
            <div class="aspect-[16/9] bg-slate-100 overflow-hidden relative">
              <img
                :src="art.cover_image || '/images/article-classroom.jpg'"
                :alt="art.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span class="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-csf-navy/90 text-sky-300 text-[11px] font-semibold">
                {{ art.category }}
              </span>
            </div>
            <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div class="space-y-2.5">
                <h2 class="font-bold text-lg text-slate-900 group-hover:text-sky-700 transition leading-snug">
                  {{ art.title }}
                </h2>
                <p class="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {{ art.excerpt }}
                </p>
              </div>
              <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>{{ art.author_name }}</span>
                <span class="font-bold text-sky-700">อ่านบทความ →</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'คลังความรู้และบริการซัพพอร์ต (Knowledge & Product Support)' })

const selectedCat = ref('all')
const { data } = await useFetch('/api/articles', {
  query: computed(() => ({ category: selectedCat.value }))
})
const articles = computed(() => data.value?.articles || [])
</script>
