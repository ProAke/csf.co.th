<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900">ใบขอราคาและข้อความลูกค้า (B2B Inquiries CRM)</h2>
        <p class="text-xs text-slate-500">รวมรายการติดต่อจากหน้าเว็บ, LINE OA Auto-Lead และ Facebook Messenger</p>
      </div>

      <div class="flex gap-2">
        <select v-model="statusFilter" class="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold">
          <option value="all">ทุกสถานะ</option>
          <option value="new">ใหม่ (new)</option>
          <option value="in_progress">กำลังดำเนินการ</option>
          <option value="quoted">ส่งใบเสนอราคาแล้ว</option>
          <option value="closed">ปิดงาน</option>
        </select>
      </div>
    </div>

    <div class="space-y-4">
      <div
        v-for="inq in filteredInquiries"
        :key="inq.id"
        class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded">{{ inq.ref_code }}</span>
              <span class="font-bold text-slate-900">{{ inq.customer_name }}</span>
              <span v-if="inq.company_name" class="text-xs text-slate-500">• {{ inq.company_name }}</span>
              <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-mono">{{ inq.source_channel }}</span>
            </div>
            <h3 class="mt-1 font-bold text-sm text-slate-800">{{ inq.subject }}</h3>
          </div>

          <div class="flex items-center gap-2">
            <select
              v-model="inq.status"
              @change="updateInquiry(inq)"
              class="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
            >
              <option value="new">ใหม่ (new)</option>
              <option value="in_progress">กำลังดำเนินการ</option>
              <option value="quoted">ส่งใบเสนอราคาแล้ว</option>
              <option value="closed">ปิดการขาย/เสร็จสิ้น</option>
            </select>
            <button
              type="button"
              @click="deleteInquiry(inq.id)"
              class="px-2.5 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-600"
            >
              ลบ
            </button>
          </div>
        </div>

        <p class="text-sm text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line">
          {{ inq.message }}
        </p>

        <!-- Attached Documents (PDF, Image, Excel, Word, PowerPoint) -->
        <div
          v-if="inq.attachments && inq.attachments.length"
          class="p-3.5 rounded-xl bg-sky-50/70 border border-sky-100 space-y-2"
        >
          <div class="text-xs font-bold text-slate-800">
            📎 เอกสารแนบจากลูกค้า ({{ inq.attachments.length }} ไฟล์):
          </div>
          <div class="flex flex-wrap gap-2">
            <a
              v-for="(att, idx) in inq.attachments"
              :key="idx"
              :href="att.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-400 text-xs font-semibold text-slate-800 transition shadow-sm"
            >
              <span class="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-mono text-[10px] font-extrabold uppercase">
                {{ att.ext || 'FILE' }}
              </span>
              <span class="truncate max-w-[220px]">{{ att.name }}</span>
              <span v-if="att.size" class="text-[10px] text-slate-400">
                ({{ Math.max(1, Math.round(att.size / 1024)) }} KB)
              </span>
            </a>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span v-if="inq.phone">📞 โทร: <strong class="text-slate-800">{{ inq.phone }}</strong></span>
          <span v-if="inq.email">✉️ อีเมล: <strong class="text-slate-800">{{ inq.email }}</strong></span>
          <span v-if="inq.line_id" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
            💬 LINE ID ลูกค้า: <strong class="font-mono">{{ inq.line_id }}</strong>
          </span>
          <span v-if="inq.product_sku" class="font-mono text-sky-700 font-bold">SKU: {{ inq.product_sku }}</span>
        </div>

        <div class="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
          <input
            v-model="inq.admin_notes"
            type="text"
            placeholder="บันทึกภายในฝ่ายขาย เช่น ส่งใบเสนอราคาเลขที่ QT-2026-089 แล้ว..."
            class="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-sky-400"
          />
          <button
            type="button"
            @click="updateInquiry(inq)"
            class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-sky-700 text-white text-xs font-bold shrink-0 transition"
          >
            บันทึกโน้ต
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'office' })
useHead({ title: 'ใบขอราคาและข้อความลูกค้า (Admin Inquiries)' })

const { adminFetch } = useAdminAuth()
const inquiries = ref<any[]>([])
const statusFilter = ref('all')

const filteredInquiries = computed(() => {
  if (statusFilter.value === 'all') return inquiries.value
  return inquiries.value.filter(i => i.status === statusFilter.value)
})

async function loadInquiries() {
  const res = await adminFetch('/api/office/inquiries')
  inquiries.value = res.inquiries || []
}

async function updateInquiry(inq: any) {
  await adminFetch(`/api/office/inquiries/${inq.id}`, {
    method: 'PUT',
    body: {
      status: inq.status,
      admin_notes: inq.admin_notes || ''
    }
  })
}

async function deleteInquiry(id: number) {
  await adminFetch(`/api/office/inquiries/${id}`, { method: 'DELETE' })
  await loadInquiries()
}

onMounted(loadInquiries)
</script>
