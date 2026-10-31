<template>
  <footer class="bg-csf-navy text-slate-300 border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
        <!-- Brand Column -->
        <div class="lg:col-span-4 space-y-4">
          <BrandLogo variant="dark" size="md" />

          <p class="text-sm text-slate-400 leading-relaxed">
            ผู้นำเข้าและจัดจำหน่ายอุปกรณ์เทคโนโลยีคุณภาพสูง ด้าน IT Solution, Telecom Network, Audio/Video, Broadcasting, CCTV และ Electronic Component พร้อมบริการหลังการขายที่รวดเร็วสำหรับองค์กร
          </p>

          <div class="pt-1 text-xs text-slate-400 font-mono">
            เลขประจำตัวผู้เสียภาษี: <span class="text-slate-200">{{ settings.tax_id || '0105560106452 (สำนักงานใหญ่)' }}</span>
          </div>

          <!-- Social Connect Buttons -->
          <div class="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              v-if="social?.line_oa?.is_enabled !== false"
              type="button"
              @click="openLineModal()"
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-semibold transition"
            >
              <MessageCircle class="w-4 h-4" />
              <span>LINE OA: {{ social?.line_oa?.handle_or_url || '@csf.co.th' }}</span>
            </button>
            <a
              v-if="social?.facebook?.is_enabled !== false"
              :href="facebookUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-semibold transition"
            >
              <Globe class="w-4 h-4" />
              <span>Facebook Page</span>
            </a>
          </div>
        </div>

        <!-- Product Categories -->
        <div class="lg:col-span-3 space-y-3">
          <h3 class="text-sm font-bold uppercase tracking-wider text-white">กลุ่มสินค้าและโซลูชัน</h3>
          <ul class="space-y-2.5 text-sm">
            <li v-for="cat in categories" :key="cat.slug">
              <NuxtLink
                :to="`/products?category=${cat.slug}`"
                class="text-slate-400 hover:text-sky-300 transition flex items-center gap-2"
              >
                <ChevronRight class="w-3.5 h-3.5 text-sky-500" />
                <span>{{ cat.name_en }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Quick Corporate Links (Original CSF structure preserved & upgraded) -->
        <div class="lg:col-span-2 space-y-3">
          <h3 class="text-sm font-bold uppercase tracking-wider text-white">ข้อมูลองค์กร</h3>
          <ul class="space-y-2.5 text-sm">
            <li>
              <NuxtLink to="/about" class="text-slate-400 hover:text-sky-300 transition">Company Profile</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/about#vision" class="text-slate-400 hover:text-sky-300 transition">Mission &amp; Vision</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/about#management" class="text-slate-400 hover:text-sky-300 transition">Management Policy</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/knowledge" class="text-slate-400 hover:text-sky-300 transition">Technology &amp; Support</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contact" class="text-slate-400 hover:text-sky-300 transition">ขอใบเสนอราคา (RFQ)</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Contact Details -->
        <div class="lg:col-span-3 space-y-3">
          <h3 class="text-sm font-bold uppercase tracking-wider text-white">ที่อยู่และช่องทางติดต่อ</h3>
          <div class="space-y-3 text-sm text-slate-400">
            <div class="flex items-start gap-2.5">
              <MapPin class="w-4 h-4 text-sky-400 shrink-0 mt-1" />
              <span>{{ settings.address_th || '481/78 หมู่บ้านซื่อตรงพรีเมี่ยม พระราม 2 ถ.แสมดำ เขตบางขุนเทียน กรุงเทพฯ 10150' }}</span>
            </div>
            <div class="flex items-center gap-2.5">
              <Phone class="w-4 h-4 text-sky-400 shrink-0" />
              <a :href="`tel:${settings.phone_primary || '081-308-9678'}`" class="text-white font-mono hover:text-sky-300">
                {{ settings.phone_primary || '081-308-9678' }}
              </a>
            </div>
            <div class="flex items-start gap-2.5">
              <Mail class="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div class="space-y-0.5">
                <div>ฝ่ายขาย: <a :href="`mailto:${settings.email_sales || 'sales@csf.co.th'}`" class="text-slate-200 hover:text-sky-300">{{ settings.email_sales || 'sales@csf.co.th' }}</a></div>
                <div>ทั่วไป: <a :href="`mailto:${settings.email_info || 'info@csf.co.th'}`" class="text-slate-200 hover:text-sky-300">{{ settings.email_info || 'info@csf.co.th' }}</a></div>
              </div>
            </div>
            <div class="flex items-center gap-2.5">
              <Clock class="w-4 h-4 text-sky-400 shrink-0" />
              <span>{{ settings.working_hours || 'จันทร์ – ศุกร์ เวลา 09:00 – 17:00 น.' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-12 pt-6 border-t border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {{ new Date().getFullYear() }} {{ settings.company_name_th || 'บริษัท ซีเอสเอฟ จำกัด' }} (csf.co.th). All rights reserved.</p>
        <p>Power by : VPSLive</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ChevronRight, Clock, Cpu, Globe, Mail, MapPin, MessageCircle, Phone } from 'lucide-vue-next'

const { siteState, openLineModal, facebookUrl } = useSiteData()
const settings = computed(() => siteState.value?.settings || {})
const categories = computed(() => siteState.value?.categories || [])
const social = computed(() => siteState.value?.social || {})
</script>
