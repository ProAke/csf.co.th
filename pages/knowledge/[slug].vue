<template>
  <div v-if="article" class="bg-slate-50 py-10 lg:py-14">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <nav class="flex items-center gap-2 text-xs text-slate-500">
        <NuxtLink to="/" class="hover:text-sky-700">หน้าแรก</NuxtLink>
        <span>/</span>
        <NuxtLink to="/knowledge" class="hover:text-sky-700">ความรู้ &amp; ซัพพอร์ต</NuxtLink>
        <span>/</span>
        <span class="text-slate-800 font-semibold truncate">{{ article.title }}</span>
      </nav>

      <article class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="aspect-[21/9] bg-slate-900 overflow-hidden">
          <img
            :src="article.cover_image || '/images/article-classroom.jpg'"
            :alt="article.title"
            class="w-full h-full object-cover"
          />
        </div>

        <div class="p-6 sm:p-10 space-y-6">
          <div class="flex flex-wrap items-center gap-3 text-xs">
            <span class="px-3 py-1 rounded-full bg-sky-50 text-sky-700 font-bold">{{ article.category }}</span>
            <span class="text-slate-400">โดย {{ article.author_name }}</span>
            <span class="text-slate-400">• เข้าชม {{ article.views_count }} ครั้ง</span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
            {{ article.title }}
          </h1>

          <div class="space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base">
            <template v-for="(block, i) in formattedBlocks" :key="i">
              <h3 v-if="block.type === 'h3'" class="text-lg font-extrabold text-slate-900 pt-3">
                {{ block.text }}
              </h3>
              <p v-else class="whitespace-pre-line">{{ block.text }}</p>
            </template>
          </div>

          <div class="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div class="text-sm font-semibold text-slate-700">ต้องการปรึกษาทีมวิศวกรเพิ่มเติมเกี่ยวกับหัวข้อนี้?</div>
            <div class="flex flex-wrap gap-2.5">
              <button
                type="button"
                @click="openLineModal()"
                class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold transition"
              >
                <MessageCircle class="w-4 h-4" />
                <span>ปรึกษาทาง LINE OA</span>
              </button>
              <button
                type="button"
                @click="openQuoteModal(null)"
                class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-csf-navy hover:bg-sky-700 text-white text-xs font-bold transition"
              >
                <FileText class="w-4 h-4" />
                <span>ขอใบเสนอราคา</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText, MessageCircle } from 'lucide-vue-next'

const route = useRoute()
const { openQuoteModal, openLineModal } = useSiteData()

const { data } = await useFetch(`/api/articles/${route.params.slug}`)
const article = computed(() => data.value?.article || null)

useHead(() => ({
  title: article.value?.title || 'บทความเทคโนโลยี'
}))

const formattedBlocks = computed(() => {
  const raw = String(article.value?.content || '')
  return raw
    .split(/\n\n+/)
    .map(chunk => chunk.trim())
    .filter(Boolean)
    .map(chunk => {
      if (chunk.startsWith('### ')) {
        return { type: 'h3', text: chunk.slice(4) }
      }
      return { type: 'p', text: chunk.replace(/\*\*(.*?)\*\*/g, '$1') }
    })
})
</script>
