<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-extrabold text-slate-900">ตั้งค่าข้อมูลบริษัทและเนื้อหาหน้าเว็บ (Site Settings)</h2>
      <p class="text-xs text-slate-500">แก้ไขข้อมูลนิติบุคคล ประวัติบริษัท วิสัยทัศน์ เบอร์โทรศัพท์ อีเมล และที่อยู่สำนักงานใหญ่</p>
    </div>

    <div v-if="saved" class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
      ✓ บันทึกข้อมูลบริษัทเรียบร้อยแล้ว ข้อมูลหน้าเว็บหลักอัปเดตทันที!
    </div>

    <form @submit.prevent="saveSettings" class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 text-sm">
      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
        <AdminImageField
          v-model="settings.site_logo"
          label="โลโก้หลักของเว็บไซต์ (csf_logo.png — จัดเก็บในเซิร์ฟเวอร์ ไม่ลิงก์เว็บต้นทาง)"
          folder="brand"
          exact-path="/uploads/brand/csf_logo.png"
          placeholder="/uploads/brand/csf_logo.png"
        />
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">โดเมนเว็บไซต์ปัจจุบัน (UAT / Production URL)</label>
          <input
            v-model="settings.site_url"
            type="text"
            placeholder="https://uat.csf.co.th"
            class="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-sm bg-white"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อบริษัท (ภาษาไทย)</label>
          <input v-model="settings.company_name_th" type="text" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อบริษัท (ภาษาอังกฤษ)</label>
          <input v-model="settings.company_name_en" type="text" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">เลขประจำตัวผู้เสียภาษี</label>
          <input v-model="settings.tax_id" type="text" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">เวลาทำการ</label>
          <input v-model="settings.working_hours" type="text" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์หลัก</label>
          <input v-model="settings.phone_primary" type="text" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">อีเมลฝ่ายขาย</label>
          <input v-model="settings.email_sales" type="text" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">อีเมลติดต่อทั่วไป</label>
          <input v-model="settings.email_info" type="text" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm" />
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">ที่อยู่สำนักงานใหญ่ (ภาษาไทย)</label>
        <input v-model="settings.address_th" type="text" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm" />
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">ที่อยู่สำนักงานใหญ่ (ภาษาอังกฤษ)</label>
        <input v-model="settings.address_en" type="text" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm" />
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">ประวัติและความเป็นมาของบริษัท (History of CSF Technology Touch)</label>
        <textarea v-model="settings.history_text" rows="5" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm leading-relaxed"></textarea>
      </div>

      <div class="pt-3 border-t border-slate-100 flex justify-end">
        <button type="submit" class="px-6 py-2.5 rounded-xl bg-csf-navy hover:bg-sky-700 text-white text-xs font-bold transition">
          บันทึกข้อมูลเว็บไซต์ทั้งหมด
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'office' })
useHead({ title: 'ตั้งค่าข้อมูลเว็บไซต์ (Site Settings)' })

const { adminFetch } = useAdminAuth()
const { fetchSite } = useSiteData()
const settings = reactive<Record<string, any>>({
  site_logo: '/uploads/brand/csf_logo.png',
  site_url: 'https://uat.csf.co.th',
  company_name_th: '',
  company_name_en: '',
  tax_id: '',
  working_hours: '',
  phone_primary: '',
  email_sales: '',
  email_info: '',
  address_th: '',
  address_en: '',
  history_text: ''
})
const saved = ref(false)

onMounted(async () => {
  const res = await adminFetch('/api/office/settings')
  Object.assign(settings, res.settings || {})
})

async function saveSettings() {
  saved.value = false
  await adminFetch('/api/office/settings', {
    method: 'PUT',
    body: { settings }
  })
  await fetchSite(true)
  saved.value = true
}
</script>
