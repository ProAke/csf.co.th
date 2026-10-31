<template>
  <div>
    <!-- Page Header -->
    <section class="bg-csf-navy text-white py-14 lg:py-20 relative overflow-hidden">
      <div class="tech-grid-bg absolute inset-0 pointer-events-none"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <span class="text-xs font-bold uppercase tracking-widest text-sky-400">COMPANY PROFILE • ABOUT US</span>
        <h1 class="mt-2 text-3xl sm:text-4xl font-extrabold">เกี่ยวกับ บริษัท ซีเอสเอฟ จำกัด</h1>
        <p class="mt-3 text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
          {{ settings.brand_tagline || 'CSF Technology Touch — ผู้นำเข้าและจัดจำหน่ายอุปกรณ์เทคโนโลยีคุณภาพสูงสำหรับองค์กร' }}
        </p>
      </div>
    </section>

    <!-- Company Profile & History -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div class="lg:col-span-7 space-y-5">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold">
            History of CSF Technology Touch
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ประวัติความเป็นมาและเจตนารมณ์ในการดำเนินธุรกิจ
          </h2>
          <p class="text-slate-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
            {{ settings.history_text }}
          </p>

          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div class="text-xs text-slate-400 font-semibold">ชื่อนิติบุคคล</div>
              <div class="font-bold text-slate-900">{{ settings.company_name_th || 'บริษัท ซีเอสเอฟ จำกัด' }}</div>
            </div>
            <div>
              <div class="text-xs text-slate-400 font-semibold">เลขประจำตัวผู้เสียภาษี</div>
              <div class="font-mono font-bold text-sky-700">{{ settings.tax_id || '0105560106452 (สำนักงานใหญ่)' }}</div>
            </div>
            <div class="sm:col-span-2">
              <div class="text-xs text-slate-400 font-semibold">สำนักงานใหญ่</div>
              <div class="text-slate-700">{{ settings.address_th }}</div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-5">
          <div class="rounded-3xl overflow-hidden shadow-xl border border-slate-200">
            <img src="/images/hero-it.jpg" alt="CSF Technology Touch" class="w-full h-full object-cover aspect-[4/3]" />
          </div>
        </div>
      </div>
    </section>

    <!-- Mission & Vision -->
    <section id="vision" class="py-16 bg-slate-50 border-t border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div class="max-w-3xl">
          <span class="text-xs font-bold uppercase tracking-widest text-sky-600">MISSION &amp; VISION</span>
          <h2 class="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">วิสัยทัศน์และมาตรฐานการให้บริการ</h2>
          <p class="mt-2 text-sm sm:text-base text-slate-600">{{ settings.vision_intro }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(pillar, idx) in visionPillars"
            :key="idx"
            class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3"
          >
            <div class="w-10 h-10 rounded-xl bg-csf-navy text-sky-400 font-mono font-bold flex items-center justify-center">
              0{{ Number(idx) + 1 }}
            </div>
            <h3 class="font-bold text-slate-900 text-base">{{ pillar.title }}</h3>
            <p class="text-sm text-slate-600 leading-relaxed">{{ pillar.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Management Policy -->
    <section id="management" class="py-16 bg-white border-t border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-csf-navy text-white rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div class="space-y-3 max-w-2xl">
            <span class="text-xs font-bold uppercase tracking-widest text-sky-400">MANAGEMENT POLICY</span>
            <h2 class="text-2xl sm:text-3xl font-extrabold">นโยบายการบริหารและดูแลลูกค้าองค์กร</h2>
            <p class="text-sm sm:text-base text-slate-300 leading-relaxed">
              เรามุ่งเน้นการทำงานแบบพันธมิตรระยะยาวกับผู้ประกอบการ หน่วยงานราชการ สถานศึกษา และผู้รับเหมาวางระบบ (System Integrator) ด้วยการคัดเลือกอุปกรณ์ที่เชื่อถือได้ มีอะไหล่รองรับ และให้คำปรึกษาตั้งแต่วางสเปกจนถึงดูแลหลังการขาย
            </p>
          </div>
          <div class="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              @click="openQuoteModal(null)"
              class="px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition"
            >
              ปรึกษาโครงการ / ขอใบเสนอราคา
            </button>
            <NuxtLink
              to="/contact"
              class="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm transition"
            >
              ดูแผนที่และข้อมูลติดต่อ
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'เกี่ยวกับบริษัท (Company Profile & Vision)' })

const { siteState, openQuoteModal } = useSiteData()
const settings = computed(() => siteState.value?.settings || {})
const visionPillars = computed(() => (Array.isArray(settings.value?.vision_pillars) ? settings.value.vision_pillars : []))
</script>
