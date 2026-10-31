<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900">จัดการบทความเทคโนโลยี &amp; ซัพพอร์ต (Articles CMS)</h2>
        <p class="text-xs text-slate-500">เขียนข่าวสาร คู่มือเทคนิค และการดูแลหลังการขาย พร้อมแชร์ขึ้น Facebook / LINE OA</p>
      </div>
      <button
        type="button"
        @click="openModal()"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-csf-navy hover:bg-sky-700 text-white text-xs font-bold transition"
      >
        <Plus class="w-4 h-4" />
        <span>เขียนบทความใหม่</span>
      </button>
    </div>

    <div v-if="toast" class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between">
      <span>{{ toast }}</span>
      <button type="button" @click="toast = ''">✕</button>
    </div>

    <div class="space-y-3">
      <div
        v-for="art in articles"
        :key="art.id"
        class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div class="flex items-start gap-4">
          <img :src="art.cover_image || '/images/article-classroom.jpg'" class="w-24 h-16 rounded-xl object-cover border border-slate-200 shrink-0" />
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-sky-50 text-sky-700 text-[11px] font-bold">{{ art.category }}</span>
              <span class="text-[11px] text-slate-400">อ่าน {{ art.views_count }} ครั้ง</span>
            </div>
            <h3 class="font-bold text-slate-900">{{ art.title }}</h3>
            <p class="text-xs text-slate-500 line-clamp-1">{{ art.excerpt }}</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            @click="shareArticle(art, 'facebook')"
            class="px-3 py-1.5 rounded-lg bg-[#1877F2]/15 hover:bg-[#1877F2] text-blue-800 hover:text-white text-xs font-bold transition"
          >
            โพสต์ขึ้น FB
          </button>
          <button
            type="button"
            @click="shareArticle(art, 'line_oa')"
            class="px-3 py-1.5 rounded-lg bg-[#06C755]/15 hover:bg-[#06C755] text-emerald-800 hover:text-white text-xs font-bold transition"
          >
            ส่งเข้า LINE OA
          </button>
          <button
            type="button"
            @click="openModal(art)"
            class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
          >
            แก้ไข
          </button>
          <button
            type="button"
            @click="removeArticle(art.id)"
            class="px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-600"
          >
            ลบ
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="font-bold text-base text-slate-900">{{ editingId ? 'แก้ไขบทความ' : 'เขียนบทความใหม่' }}</h3>
          <button type="button" @click="modalOpen = false" class="text-slate-400">✕</button>
        </div>

        <form @submit.prevent="saveArticle" class="space-y-3.5 text-sm">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">หัวข้อบทความ *</label>
            <input v-model="form.title" required type="text" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">หมวดหมู่บทความ</label>
              <select v-model="form.category" class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm">
                <option value="Product Support">Product Support</option>
                <option value="Technology Knowledge">Technology Knowledge</option>
                <option value="Company News">Company News</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ผู้เขียน</label>
              <input v-model="form.author_name" type="text" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
            </div>
          </div>

          <AdminImageField
            v-model="form.cover_image"
            label="รูปปกบทความ (จัดเก็บในเซิร์ฟเวอร์)"
            folder="articles"
            placeholder="/uploads/articles/..."
          />

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">คำโปรยย่อ (Excerpt)</label>
            <textarea v-model="form.excerpt" rows="2" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"></textarea>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">เนื้อหาบทความ * (ใช้ ### นำหน้าหัวข้อย่อยได้)</label>
            <textarea v-model="form.content" required rows="7" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"></textarea>
          </div>

          <label class="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
            <input v-model="form.is_published" type="checkbox" class="rounded text-sky-600" />
            <span>เผยแพร่บทความบนหน้าเว็บไซต์</span>
          </label>

          <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" @click="modalOpen = false" class="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold">
              ยกเลิก
            </button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-csf-navy hover:bg-sky-700 text-white text-xs font-bold">
              บันทึกบทความ
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
useHead({ title: 'จัดการบทความ (Admin Articles)' })

const config = useRuntimeConfig()
const { adminFetch } = useAdminAuth()
const articles = ref<any[]>([])
const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const toast = ref('')

const form = reactive({
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  category: 'Product Support',
  cover_image: '/images/article-classroom.jpg',
  author_name: 'ทีมวิศวกร CSF Technology Touch',
  is_published: true
})

async function loadArticles() {
  const res = await adminFetch('/api/office/articles')
  articles.value = res.articles || []
}

function openModal(item?: any) {
  if (item) {
    editingId.value = item.id
    Object.assign(form, {
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt || '',
      content: item.content || '',
      category: item.category || 'Product Support',
      cover_image: item.cover_image || '/images/article-classroom.jpg',
      author_name: item.author_name || 'ทีมวิศวกร CSF Technology Touch',
      is_published: Boolean(item.is_published)
    })
  } else {
    editingId.value = null
    Object.assign(form, {
      slug: '',
      title: '',
      excerpt: '',
      content: '',
      category: 'Product Support',
      cover_image: '/images/article-classroom.jpg',
      author_name: 'ทีมวิศวกร CSF Technology Touch',
      is_published: true
    })
  }
  modalOpen.value = true
}

async function saveArticle() {
  if (editingId.value) {
    await adminFetch(`/api/office/articles/${editingId.value}`, { method: 'PUT', body: form })
    toast.value = 'อัปเดตบทความเรียบร้อยแล้ว'
  } else {
    await adminFetch('/api/office/articles', { method: 'POST', body: form })
    toast.value = 'เผยแพร่บทความใหม่เรียบร้อยแล้ว'
  }
  modalOpen.value = false
  await loadArticles()
}

async function removeArticle(id: number) {
  await adminFetch(`/api/office/articles/${id}`, { method: 'DELETE' })
  await loadArticles()
}

async function shareArticle(art: any, platform: 'line_oa' | 'facebook') {
  const link = `${config.public.siteUrl || 'https://uat.csf.co.th'}/knowledge/${art.slug}`
  const res = await adminFetch<{ detail: string }>('/api/office/integrations/broadcast', {
    method: 'POST',
    body: {
      platform,
      message: `📚 บทความใหม่จาก CSF Technology Touch:\n${art.title}\n\n${art.excerpt}\nอ่านต่อ: ${link}`,
      link_url: link
    }
  })
  toast.value = res.detail
}

onMounted(loadArticles)
</script>
