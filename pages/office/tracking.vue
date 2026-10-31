<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-extrabold text-slate-900">
        ติดโค้ด Google Analytics, Facebook Pixel Tag &amp; สคริปต์เพิ่มเติม
      </h2>
      <p class="text-xs text-slate-500">
        กำหนดค่า Measurement ID, Tag Manager, Facebook Pixel และโค้ดสคริปต์อื่นๆ (เช่น Google Ads, LINE Tag, TikTok Pixel, Search Console) มีผลกับหน้าเว็บไซต์ทันทีโดยไม่ต้องแก้โค้ด
      </p>
    </div>

    <div
      v-if="saved"
      class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between"
    >
      <span>✓ บันทึกโค้ดติดตามผล (Analytics &amp; Tags) เรียบร้อยแล้ว ระบบเริ่มทำงานบนหน้าเว็บไซต์ทันที!</span>
      <button type="button" @click="saved = false" class="font-bold">✕</button>
    </div>

    <!-- Active Status Summary -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div class="text-xs font-bold text-slate-500">Google Analytics 4 (GA4)</div>
          <div class="font-mono text-sm font-extrabold text-slate-900 mt-0.5">
            {{ form.ga4_measurement_id || 'ยังไม่ได้ระบุ' }}
          </div>
        </div>
        <span
          class="px-2.5 py-1 rounded-full text-[11px] font-bold"
          :class="form.ga4_measurement_id ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
        >
          {{ form.ga4_measurement_id ? 'ทำงานอยู่' : 'ปิด' }}
        </span>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div class="text-xs font-bold text-slate-500">Google Tag Manager (GTM)</div>
          <div class="font-mono text-sm font-extrabold text-slate-900 mt-0.5">
            {{ form.gtm_container_id || 'ยังไม่ได้ระบุ' }}
          </div>
        </div>
        <span
          class="px-2.5 py-1 rounded-full text-[11px] font-bold"
          :class="form.gtm_container_id ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
        >
          {{ form.gtm_container_id ? 'ทำงานอยู่' : 'ปิด' }}
        </span>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div class="text-xs font-bold text-slate-500">Facebook / Meta Pixel</div>
          <div class="font-mono text-sm font-extrabold text-slate-900 mt-0.5">
            {{ form.facebook_pixel_id || 'ยังไม่ได้ระบุ' }}
          </div>
        </div>
        <span
          class="px-2.5 py-1 rounded-full text-[11px] font-bold"
          :class="form.facebook_pixel_id ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'"
        >
          {{ form.facebook_pixel_id ? 'ทำงานอยู่' : 'ปิด' }}
        </span>
      </div>
    </div>

    <form @submit.prevent="saveTracking" class="space-y-6">
      <!-- Standard IDs -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <h3 class="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
          1. ตั้งค่ารหัสมาตรฐาน (ระบบสร้างสคริปต์และยิง Event PageView + Lead ให้อัตโนมัติ)
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Google Analytics 4 (Measurement ID)
            </label>
            <input
              v-model="form.ga4_measurement_id"
              type="text"
              placeholder="เช่น G-XXXXXXXXXX"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
            <p class="text-[11px] text-slate-400 mt-1">ติดตั้ง gtag.js และเก็บสถิติการส่งฟอร์มติดต่ออัตโนมัติ</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Google Tag Manager (Container ID)
            </label>
            <input
              v-model="form.gtm_container_id"
              type="text"
              placeholder="เช่น GTM-XXXXXXX"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
            <p class="text-[11px] text-slate-400 mt-1">แทรกทั้งสคริปต์ใน &lt;head&gt; และ &lt;noscript&gt; ใน &lt;body&gt;</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Facebook / Meta Pixel ID
            </label>
            <input
              v-model="form.facebook_pixel_id"
              type="text"
              placeholder="เช่น 123456789012345"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
            <p class="text-[11px] text-slate-400 mt-1">ยิง fbq('track', 'PageView') และ 'Lead' เมื่อลูกค้าขอใบเสนอราคา</p>
          </div>
        </div>
      </div>

      <!-- Custom Scripts -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <h3 class="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
          2. วางโค้ดสคริปต์อื่นๆ เพิ่มเติม (Custom Tags / Verification / Pixel อื่นๆ)
        </h3>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">
            โค้ดในส่วน <code>&lt;head&gt;...&lt;/head&gt;</code>
            <span class="font-normal text-slate-400">(เช่น Google Search Console Meta, Google Ads, LINE Tag, TikTok Pixel, Clarity)</span>
          </label>
          <textarea
            v-model="form.custom_head_scripts"
            rows="5"
            placeholder="<!-- วางโค้ด <meta ...> หรือ <script>...</script> สำหรับส่วน <head> ที่นี่ -->"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-sky-500 outline-none bg-slate-50/50"
          ></textarea>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">
            โค้ดหลังเปิดแท็ก <code>&lt;body&gt;</code>
            <span class="font-normal text-slate-400">(เช่น โค้ด &lt;noscript&gt; เสริม หรือสคริปต์ต้นหน้า)</span>
          </label>
          <textarea
            v-model="form.custom_body_start_scripts"
            rows="3"
            placeholder="<!-- วางโค้ดที่ต้องการให้แสดงหลังเปิด <body> ที่นี่ -->"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-sky-500 outline-none bg-slate-50/50"
          ></textarea>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">
            โค้ดก่อนปิดแท็ก <code>&lt;/body&gt;</code> (Footer Scripts)
            <span class="font-normal text-slate-400">(เช่น Live Chat Widget, Remarketing Script ฯลฯ)</span>
          </label>
          <textarea
            v-model="form.custom_body_end_scripts"
            rows="4"
            placeholder="<!-- วางสคริปต์ส่วนท้ายหน้าเว็บก่อนปิด </body> ที่นี่ -->"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-sky-500 outline-none bg-slate-50/50"
          ></textarea>
        </div>

        <div class="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-2.5 rounded-xl bg-csf-navy hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm"
          >
            {{ saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าโค้ดติดตามผลทั้งหมด' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'office' })
useHead({ title: 'ติดโค้ด Analytics & Facebook Tag (Tracking & Scripts)' })

const { adminFetch } = useAdminAuth()
const { fetchSite } = useSiteData()

const saving = ref(false)
const saved = ref(false)

const form = reactive({
  ga4_measurement_id: '',
  gtm_container_id: '',
  facebook_pixel_id: '',
  custom_head_scripts: '',
  custom_body_start_scripts: '',
  custom_body_end_scripts: ''
})

const fbIntegrationSnapshot = ref<any | null>(null)

onMounted(async () => {
  const [settingsRes, intRes] = await Promise.all([
    adminFetch<{ settings: Record<string, any> }>('/api/office/settings'),
    adminFetch<{ integrations: any[] }>('/api/office/integrations')
  ])
  const s = settingsRes.settings || {}
  const fb = (intRes.integrations || []).find((i: any) => i.platform === 'facebook')
  fbIntegrationSnapshot.value = fb || null

  form.ga4_measurement_id = s.ga4_measurement_id || ''
  form.gtm_container_id = s.gtm_container_id || ''
  form.facebook_pixel_id = s.facebook_pixel_id || fb?.pixel_id || ''
  form.custom_head_scripts = s.custom_head_scripts || ''
  form.custom_body_start_scripts = s.custom_body_start_scripts || ''
  form.custom_body_end_scripts = s.custom_body_end_scripts || ''
})

async function saveTracking() {
  saving.value = true
  saved.value = false
  try {
    await adminFetch('/api/office/settings', {
      method: 'PUT',
      body: {
        settings: {
          ga4_measurement_id: form.ga4_measurement_id.trim(),
          gtm_container_id: form.gtm_container_id.trim(),
          facebook_pixel_id: form.facebook_pixel_id.trim(),
          custom_head_scripts: form.custom_head_scripts,
          custom_body_start_scripts: form.custom_body_start_scripts,
          custom_body_end_scripts: form.custom_body_end_scripts
        }
      }
    })

    // Sync Facebook Pixel ID with social_integrations row as well
    if (fbIntegrationSnapshot.value) {
      await adminFetch('/api/office/integrations', {
        method: 'PUT',
        body: {
          ...fbIntegrationSnapshot.value,
          pixel_id: form.facebook_pixel_id.trim()
        }
      })
    }

    await fetchSite(true)
    saved.value = true
  } finally {
    saving.value = false
  }
}
</script>
