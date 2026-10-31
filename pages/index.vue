<template>
  <div>
    <!-- 1. Hero Slider (Upgraded from original csf.co.th 4-slide banner) -->
    <section class="relative bg-csf-navy text-white overflow-hidden">
      <div class="tech-grid-bg absolute inset-0 pointer-events-none"></div>

      <div v-if="activeBanner" class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <!-- Left Text Content -->
          <div class="lg:col-span-7 space-y-6">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-bold tracking-wider">
              <span class="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              <span>{{ activeBanner.badge || 'CSF TECHNOLOGY TOUCH' }}</span>
            </div>

            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-white">
              {{ activeBanner.title }}
            </h1>

            <p class="text-base sm:text-lg font-medium text-sky-200/95 leading-relaxed">
              {{ activeBanner.subtitle }}
            </p>

            <p class="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              {{ activeBanner.description }}
            </p>

            <div class="pt-2 flex flex-wrap items-center gap-3.5">
              <NuxtLink
                :to="activeBanner.cta_link || '/products'"
                class="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-sky-500/20"
              >
                <span>{{ activeBanner.cta_label || 'ดูสินค้าและโซลูชัน' }}</span>
                <ArrowRight class="w-4 h-4" />
              </NuxtLink>

              <button
                type="button"
                @click="openQuoteModal(null)"
                class="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm transition"
              >
                <FileText class="w-4 h-4 text-sky-300" />
                <span>{{ activeBanner.secondary_label || 'ขอใบเสนอราคา' }}</span>
              </button>
            </div>

            <!-- Slide Controls ([1] [2] [3] [4] + Prev/Next) -->
            <div v-if="banners.length > 1" class="pt-4 flex items-center gap-4">
              <div class="flex items-center gap-1.5">
                <button
                  v-for="(b, idx) in banners"
                  :key="b.id"
                  type="button"
                  @click="currentSlide = idx"
                  class="h-2.5 rounded-full transition-all"
                  :class="currentSlide === idx ? 'w-9 bg-sky-400' : 'w-2.5 bg-slate-600 hover:bg-slate-500'"
                  :aria-label="`สไลด์ที่ ${idx + 1}`"
                ></button>
              </div>
              <div class="flex items-center gap-1.5 ml-2">
                <button
                  type="button"
                  @click="prevSlide"
                  class="p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  aria-label="สไลด์ก่อนหน้า"
                >
                  <ChevronLeft class="w-4 h-4" />
                </button>
                <button
                  type="button"
                  @click="nextSlide"
                  class="p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  aria-label="สไลด์ถัดไป"
                >
                  <ChevronRight class="w-4 h-4" />
                </button>
              </div>
              <span class="text-xs font-mono text-slate-400">
                0{{ currentSlide + 1 }} / 0{{ banners.length }}
              </span>
            </div>
          </div>

          <!-- Right Visual Frame -->
          <div class="lg:col-span-5">
            <div class="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900 aspect-[4/3]">
              <img
                :src="activeBanner.image_url"
                :alt="activeBanner.title"
                class="w-full h-full object-cover transition-all duration-700"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-csf-navy/80 via-transparent to-transparent"></div>
              <div class="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-between gap-3">
                <div>
                  <div class="text-[11px] font-mono text-sky-400 font-semibold">AUTHORIZED B2B PARTNER</div>
                  <div class="text-xs text-slate-200 font-medium">สินค้าคุณภาพ • ราคาตามงบประมาณ • บริการหลังการขายรวดเร็ว</div>
                </div>
                <ShieldCheck class="w-6 h-6 text-sky-400 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trust Metrics Strip -->
      <div class="border-t border-slate-800/90 bg-slate-950/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center shrink-0">
              <Award class="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div class="text-sm font-bold text-white">แบรนด์ชั้นนำมาตรฐานสากล</div>
              <div class="text-xs text-slate-400">IT, Telecom, AV, Broadcast &amp; CCTV</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center shrink-0">
              <Truck class="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div class="text-sm font-bold text-white">จัดส่งรวดเร็ว ตรงกำหนดการ</div>
              <div class="text-xs text-slate-400">รองรับงานโครงการรัฐและเอกชน</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center shrink-0">
              <Wrench class="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div class="text-sm font-bold text-white">บริการหลังการขายมืออาชีพ</div>
              <div class="text-xs text-slate-400">ดูแลต่อเนื่อง แก้ไขปัญหารวดเร็ว</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#06C755]/15 border border-[#06C755]/30 flex items-center justify-center shrink-0">
              <MessageCircle class="w-5 h-5 text-[#4ade80]" />
            </div>
            <div>
              <div class="text-sm font-bold text-white">เชื่อม LINE OA &amp; Facebook</div>
              <div class="text-xs text-slate-400">ค้นหาสเปก / ขอใบเสนอราคาไว</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Product & Services Categories -->
    <section class="py-16 lg:py-20 bg-white border-b border-slate-200/70">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-sky-600">PRODUCT &amp; SERVICES</span>
            <h2 class="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
              กลุ่มผลิตภัณฑ์และโซลูชันเทคโนโลยีหลัก
            </h2>
          </div>
          <NuxtLink
            to="/products"
            class="inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-800"
          >
            <span>ดูแคตตาล็อกสินค้าทั้งหมด</span>
            <ArrowRight class="w-4 h-4" />
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.id"
            :to="`/products?category=${cat.slug}`"
            class="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 hover:border-sky-400 hover:shadow-xl transition-all flex flex-col"
          >
            <div class="aspect-[16/10] overflow-hidden relative bg-slate-900">
              <img
                :src="cat.image_url || '/images/hero-it.jpg'"
                :alt="cat.name_th"
                class="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent"></div>
              <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 text-slate-900 font-mono text-xs font-bold">
                {{ cat.product_count || 0 }} รายการ
              </span>
              <div class="absolute bottom-3 left-4 right-4">
                <div class="text-xs font-bold text-sky-300 uppercase tracking-wide">{{ cat.name_en }}</div>
                <h3 class="text-base font-bold text-white">{{ cat.name_th }}</h3>
              </div>
            </div>
            <div class="p-4 flex-1 flex flex-col justify-between gap-3 bg-white">
              <p class="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {{ cat.description }}
              </p>
              <span class="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 group-hover:translate-x-1 transition-transform">
                <span>เลือกดูสินค้าในหมวดนี้</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 3. Featured Products Catalog -->
    <section class="py-16 lg:py-20 bg-slate-50 tech-grid-light">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-sky-600">FEATURED HARDWARE &amp; SOLUTIONS</span>
            <h2 class="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">สินค้าเด่นยอดนิยมสำหรับองค์กรและงานโครงการ</h2>
          </div>
          <div class="flex flex-wrap gap-2">
            <NuxtLink
              to="/products"
              class="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-sky-400 text-xs font-bold text-slate-700 shadow-sm transition"
            >
              ค้นหาตามรหัส SKU ทั้งหมด
            </NuxtLink>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard v-for="prod in featuredProducts" :key="prod.id" :product="prod" />
        </div>
      </div>
    </section>

    <!-- 4. History & Vision of CSF Technology Touch (Authentic csf.co.th Heritage) -->
    <section class="py-16 lg:py-24 bg-white border-y border-slate-200/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <!-- History Column -->
          <div class="lg:col-span-6 space-y-6">
            <div>
              <span class="text-xs font-bold uppercase tracking-widest text-sky-600">HISTORY OF CSF TECHNOLOGY TOUCH</span>
              <h2 class="mt-1.5 text-2xl sm:text-3xl font-extrabold text-slate-900">
                {{ settings.company_name_th || 'บริษัท ซีเอสเอฟ จำกัด' }}
              </h2>
              <p class="mt-1 text-sm font-semibold text-sky-700">
                "การบริการที่ดี คือรากฐานสำคัญของธุรกิจ สินค้าที่ดีต้องมาพร้อมบริการที่ยอดเยี่ยมและราคาที่เหมาะสม"
              </p>
            </div>

            <p class="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
              {{ settings.history_text }}
            </p>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div
                v-for="tag in ['IT Solution', 'Telecom Network', 'Audio / Video', 'Broadcasting', 'CCTV Security', 'Electronic Component']"
                :key="tag"
                class="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs font-bold text-slate-700 flex items-center gap-2"
              >
                <CheckCircle2 class="w-4 h-4 text-sky-600 shrink-0" />
                <span>{{ tag }}</span>
              </div>
            </div>

            <div class="pt-2">
              <NuxtLink
                to="/about"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-sky-700 text-white text-sm font-semibold transition"
              >
                <span>อ่านประวัติและนโยบายบริหารฉบับเต็ม</span>
                <ArrowRight class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>

          <!-- Vision 4 Pillars Column -->
          <div class="lg:col-span-6 bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200/90 space-y-6">
            <div>
              <span class="text-xs font-bold uppercase tracking-widest text-sky-600">VISION OF CSF TECHNOLOGY TOUCH</span>
              <h3 class="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">วิสัยทัศน์และพันธกิจหลัก 4 ประการ</h3>
              <p class="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {{ settings.vision_intro }}
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="(pillar, idx) in visionPillars"
                :key="idx"
                class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2"
              >
                <div class="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 font-mono text-xs font-extrabold flex items-center justify-center">
                  0{{ Number(idx) + 1 }}
                </div>
                <h4 class="font-bold text-slate-900 text-sm">{{ pillar.title }}</h4>
                <p class="text-xs text-slate-600 leading-relaxed">{{ pillar.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. Omni-Channel LINE OA & Facebook Connect Section -->
    <section class="py-16 bg-csf-navy text-white relative overflow-hidden">
      <div class="tech-grid-bg absolute inset-0 pointer-events-none"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div class="lg:col-span-7 space-y-4">
            <span class="inline-block px-3 py-1 rounded-full bg-[#06C755]/20 text-[#4ade80] text-xs font-bold">
              OMNI-CHANNEL B2B SUPPORT
            </span>
            <h2 class="text-2xl sm:text-3xl font-extrabold">
              เชื่อมต่อฉับไวผ่าน LINE Official Account และ Facebook Page
            </h2>
            <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
              ไม่ว่าจะต้องการเช็คสเปกสินค้าด่วน ขอใบเสนอราคาสำหรับจัดซื้อองค์กร หรือปรึกษาปัญหาการติดตั้งหลังการขาย สามารถแชทกับทีมวิศวกรและฝ่ายขาย CSF ได้โดยตรง ระบบรองรับการค้นหารหัสสินค้าอัตโนมัติและการแจ้งเตือนแบบเรียลไทม์
            </p>
            <div class="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                @click="openLineModal()"
                class="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-sm font-bold transition shadow-lg"
              >
                <MessageCircle class="w-5 h-5" />
                <span>เพิ่มเพื่อน LINE OA ({{ social?.line_oa?.handle_or_url || '@csf.co.th' }})</span>
              </button>
              <a
                :href="facebookUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-sm font-bold transition shadow-lg"
              >
                <Globe class="w-5 h-5" />
                <span>ติดตามเพจ Facebook CSF</span>
              </a>
            </div>
          </div>

          <div class="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-2">
              <div class="text-xs font-mono font-bold text-[#4ade80]">LINE SMART AUTO-SPEC</div>
              <div class="text-sm font-bold text-white">พิมพ์รหัส SKU รับสเปกทันที</div>
              <p class="text-xs text-slate-400 leading-relaxed">
                พิมพ์เช่น <code class="text-sky-300">DSP501</code> หรือ <code class="text-sky-300">SN-NVR10</code> ในแชท LINE OA ระบบส่งการ์ด Flex สเปกและลิงก์ขอราคาอัตโนมัติ
              </p>
            </div>
            <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-2">
              <div class="text-xs font-mono font-bold text-sky-400">DIRECT SALES ALERT</div>
              <div class="text-sm font-bold text-white">ส่งใบเสนอราคาไวในเวลาทำการ</div>
              <p class="text-xs text-slate-400 leading-relaxed">
                ทุกคำขอจากหน้าเว็บไซต์เชื่อมต่อฐานข้อมูล MariaDB และส่งแจ้งเตือนเข้าทีมฝ่ายขายทันที
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. Technology Knowledge & Product Support Articles -->
    <section class="py-16 lg:py-20 bg-slate-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-sky-600">KNOWLEDGE &amp; PRODUCT SUPPORT</span>
            <h2 class="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">คลังความรู้เทคโนโลยีและบริการซัพพอร์ต</h2>
          </div>
          <NuxtLink to="/knowledge" class="inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-800">
            <span>ดูบทความทั้งหมด</span>
            <ArrowRight class="w-4 h-4" />
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NuxtLink
            v-for="art in latestArticles"
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
            <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div class="space-y-2">
                <h3 class="font-bold text-slate-900 group-hover:text-sky-700 transition line-clamp-2 leading-snug">
                  {{ art.title }}
                </h3>
                <p class="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {{ art.excerpt }}
                </p>
              </div>
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>{{ art.author_name }}</span>
                <span class="font-semibold text-sky-700">อ่านต่อ →</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  MessageCircle,
  ShieldCheck,
  Truck,
  Wrench
} from 'lucide-vue-next'

const { siteState, openQuoteModal, openLineModal, facebookUrl } = useSiteData()
const { data: homeData } = await useFetch('/api/home')

const banners = computed(() => homeData.value?.banners || [])
const categories = computed(() => homeData.value?.categories || [])
const featuredProducts = computed(() => homeData.value?.featuredProducts || [])
const latestArticles = computed(() => homeData.value?.latestArticles || [])

const settings = computed(() => siteState.value?.settings || {})
const social = computed(() => siteState.value?.social || {})
const visionPillars = computed(() => {
  const p = settings.value?.vision_pillars
  return Array.isArray(p) ? p : []
})

const currentSlide = ref(0)
const activeBanner = computed(() => banners.value[currentSlide.value] || banners.value[0] || null)

function nextSlide() {
  if (!banners.value.length) return
  currentSlide.value = (currentSlide.value + 1) % banners.value.length
}

function prevSlide() {
  if (!banners.value.length) return
  currentSlide.value = (currentSlide.value - 1 + banners.value.length) % banners.value.length
}

let slideTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  slideTimer = setInterval(() => {
    if (banners.value.length > 1) nextSlide()
  }, 7000)
})
onBeforeUnmount(() => {
  if (slideTimer) clearInterval(slideTimer)
})
</script>
