<template>
  <!-- Floating Omni-Channel Connect Dock -->
  <div class="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
    <button
      v-if="social?.line_oa?.is_enabled !== false"
      type="button"
      @click="openLineModal()"
      class="group flex items-center gap-2.5 pl-3.5 pr-4 py-2.5 rounded-full bg-[#06C755] hover:bg-[#05b34c] text-white shadow-lg shadow-emerald-950/20 transition-all hover:-translate-y-0.5"
    >
      <MessageCircle class="w-5 h-5" />
      <span class="text-xs font-bold tracking-wide">แชท LINE OA</span>
    </button>

    <a
      v-if="social?.facebook?.is_enabled !== false"
      :href="facebookUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="group flex items-center gap-2.5 pl-3.5 pr-4 py-2.5 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-lg shadow-blue-950/20 transition-all hover:-translate-y-0.5"
    >
      <Globe class="w-5 h-5" />
      <span class="text-xs font-bold tracking-wide">Facebook Chat</span>
    </a>

    <button
      type="button"
      @click="openQuoteModal(null)"
      class="group flex items-center gap-2.5 pl-3.5 pr-4 py-2.5 rounded-full bg-csf-navy hover:bg-sky-700 text-white shadow-lg shadow-slate-950/30 border border-sky-400/30 transition-all hover:-translate-y-0.5"
    >
      <FileText class="w-4 h-4 text-sky-400" />
      <span class="text-xs font-bold tracking-wide">ขอใบเสนอราคาด่วน</span>
    </button>
  </div>

  <!-- LINE OA Connect & Auto-Lookup Modal -->
  <div
    v-if="lineQrModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm"
    @click.self="closeLineModal()"
  >
    <div class="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
      <div class="bg-[#06C755] px-6 py-5 text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <MessageCircle class="w-6 h-6" />
          </div>
          <div>
            <h3 class="font-bold text-lg leading-tight">{{ social?.line_oa?.display_name || 'CSF Technology Touch' }}</h3>
            <p class="text-xs text-emerald-50">LINE Official Account • {{ lineHandle }}</p>
          </div>
        </div>
        <button type="button" @click="closeLineModal()" class="p-1.5 rounded-lg hover:bg-white/20 transition">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6 space-y-5 text-center">
        <!-- Crisp stylized QR representation or custom uploaded QR URL -->
        <div class="mx-auto w-48 h-48 rounded-2xl border-2 border-emerald-100 bg-slate-50 p-3 flex items-center justify-center">
          <img
            v-if="social?.line_oa?.qr_code_url"
            :src="social.line_oa.qr_code_url"
            alt="LINE OA QR Code"
            class="w-full h-full object-contain rounded-lg"
          />
          <div v-else class="w-full h-full flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 p-3">
            <!-- Deterministic vector QR-style badge for CSF LINE OA -->
            <svg viewBox="0 0 120 120" class="w-28 h-28 text-slate-900">
              <rect x="8" y="8" width="32" height="32" rx="4" fill="none" stroke="currentColor" stroke-width="6" />
              <rect x="18" y="18" width="12" height="12" rx="2" fill="currentColor" />
              <rect x="80" y="8" width="32" height="32" rx="4" fill="none" stroke="currentColor" stroke-width="6" />
              <rect x="90" y="18" width="12" height="12" rx="2" fill="currentColor" />
              <rect x="8" y="80" width="32" height="32" rx="4" fill="none" stroke="currentColor" stroke-width="6" />
              <rect x="18" y="90" width="12" height="12" rx="2" fill="currentColor" />
              <rect x="50" y="12" width="8" height="8" fill="currentColor" />
              <rect x="62" y="20" width="8" height="16" fill="currentColor" />
              <rect x="48" y="48" width="24" height="24" rx="5" fill="#06C755" />
              <text x="60" y="64" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">CSF</text>
              <rect x="14" y="50" width="22" height="8" fill="currentColor" />
              <rect x="82" y="52" width="26" height="8" fill="currentColor" />
              <rect x="82" y="68" width="12" height="18" fill="currentColor" />
              <rect x="98" y="84" width="14" height="26" fill="currentColor" />
              <rect x="50" y="82" width="24" height="10" fill="currentColor" />
              <rect x="50" y="98" width="14" height="12" fill="currentColor" />
            </svg>
            <span class="mt-1 text-[11px] font-mono font-semibold text-emerald-700">{{ lineHandle }}</span>
          </div>
        </div>

        <div class="space-y-1.5">
          <p class="text-sm text-slate-600 leading-relaxed">
            {{
              social?.line_oa?.welcome_message ||
              'พิมพ์รหัสสินค้า เช่น DSP501, MP60U, SN-NVR10 เพื่อรับสเปกอัตโนมัติ หรือแชทคุยกับฝ่ายขายองค์กรได้ทันที'
            }}
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-2.5">
          <a
            :href="lineUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-sm font-bold transition"
          >
            <ExternalLink class="w-4 h-4" />
            <span>เพิ่มเพื่อนในแอป LINE</span>
          </a>
          <button
            type="button"
            @click="copyLineId()"
            class="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
          >
            <Check v-if="copied" class="w-4 h-4 text-emerald-600" />
            <Copy v-else class="w-4 h-4 text-slate-500" />
            <span>{{ copied ? 'คัดลอกแล้ว' : 'คัดลอกไอดี' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Quick Quotation / Inquiry Modal (Connected to MariaDB + LINE OA Alert) -->
  <div
    v-if="quoteModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm overflow-y-auto"
    @click.self="closeQuoteModal()"
  >
    <div class="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 my-8">
      <div class="bg-csf-navy px-6 py-5 text-white flex items-center justify-between">
        <div>
          <span class="text-[11px] font-bold uppercase tracking-wider text-sky-400">B2B QUOTATION &amp; SUPPORT</span>
          <h3 class="font-bold text-lg">ขอใบเสนอราคา / สอบถามสเปกสินค้า</h3>
        </div>
        <button type="button" @click="closeQuoteModal()" class="p-1.5 rounded-lg hover:bg-white/10 transition">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div v-if="submittedRef" class="p-8 text-center space-y-4">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 class="w-8 h-8" />
        </div>
        <h4 class="text-xl font-bold text-slate-900">ส่งคำขอใบเสนอราคาเรียบร้อยแล้ว!</h4>
        <p class="text-sm text-slate-600">
          รหัสอ้างอิงของคุณคือ <span class="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">{{ submittedRef }}</span>
          ระบบได้บันทึกข้อมูลพร้อมเอกสารลงฐานข้อมูลและแจ้งเตือนไปยังทีมฝ่ายขายผ่าน <strong>LINE OA</strong> ทันที
        </p>
        <div class="pt-2 flex flex-wrap justify-center gap-2.5">
          <a
            v-if="submittedOaChatUrl"
            :href="submittedOaChatUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-sm font-bold transition"
          >
            <MessageCircle class="w-4 h-4" />
            <span>ทักแชท LINE OA บริษัท ({{ lineHandle }})</span>
          </a>
          <button
            type="button"
            @click="resetAndClose()"
            class="px-5 py-2.5 rounded-xl bg-csf-navy text-white text-sm font-semibold hover:bg-sky-700 transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>

      <form v-else @submit.prevent="submitQuickQuote" class="p-6 space-y-3.5">
        <div v-if="quoteModalProduct" class="p-3.5 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between gap-3">
          <div>
            <div class="text-xs font-mono font-bold text-sky-700">SKU: {{ quoteModalProduct.sku }}</div>
            <div class="text-sm font-semibold text-slate-900">{{ quoteModalProduct.name }}</div>
          </div>
          <span class="text-[11px] px-2.5 py-1 rounded-full bg-white text-sky-700 font-semibold border border-sky-200">อ้างอิงรุ่นนี้</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล ผู้ติดต่อ *</label>
            <input
              v-model="form.customer_name"
              required
              type="text"
              placeholder="เช่น คุณสมชาย ใจดี"
              class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">ชื่อบริษัท / หน่วยงาน</label>
            <input
              v-model="form.company_name"
              type="text"
              placeholder="บริษัท / โรงเรียน / องค์กร"
              class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์ *</label>
            <input
              v-model="form.phone"
              required
              type="tel"
              placeholder="08X-XXX-XXXX"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">อีเมล</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="name@company.co.th"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-emerald-700 mb-1">LINE ID (เชื่อม LINE OA)</label>
            <input
              v-model="form.line_id"
              type="text"
              placeholder="ระบุ LINE ID ของท่าน"
              class="w-full px-3 py-2 rounded-xl border border-emerald-300 text-sm focus:ring-2 focus:ring-[#06C755] outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">รายการสินค้า / จำนวน / รายละเอียดโครงการ *</label>
          <textarea
            v-model="form.message"
            required
            rows="3"
            placeholder="ระบุรุ่นสินค้า จำนวนที่ต้องการ หรือรายละเอียดหน้างานเพื่อให้ทีมวิศวกรประเมินราคา..."
            class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
          ></textarea>
        </div>

        <div>
          <label class="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-slate-300 hover:border-sky-400 bg-slate-50 text-xs font-semibold text-slate-700 w-full justify-center">
            <Paperclip class="w-4 h-4 text-sky-600" />
            <span>แนบเอกสาร PDF, รูปภาพ, Excel, Word, PowerPoint ({{ modalFiles.length }}/5 ไฟล์)</span>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx,.csv,.doc,.docx,.ppt,.pptx"
              class="hidden"
              @change="onModalFileSelect"
            />
          </label>
          <div v-if="modalFiles.length" class="mt-1.5 flex flex-wrap gap-1.5">
            <span
              v-for="(f, idx) in modalFiles"
              :key="idx"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-[11px] font-medium text-slate-700"
            >
              <span class="truncate max-w-[160px]">{{ f.name }}</span>
              <button type="button" @click="modalFiles.splice(idx, 1)" class="text-red-500 font-bold">✕</button>
            </span>
          </div>
        </div>

        <p v-if="errorMsg" class="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ errorMsg }}</p>

        <div class="pt-1 flex items-center justify-between gap-3">
          <span class="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-[#06C755]"></span>
            แจ้งเตือนฝ่ายขายผ่าน LINE OA อัตโนมัติ
          </span>
          <button
            type="submit"
            :disabled="submitting"
            class="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-sm font-bold transition shadow-sm"
          >
            {{ submitting ? 'กำลังส่งข้อมูล...' : 'ส่งคำขอใบเสนอราคา' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, CheckCircle2, Copy, ExternalLink, FileText, Globe, MessageCircle, Paperclip, X } from 'lucide-vue-next'

const {
  siteState,
  quoteModalOpen,
  quoteModalProduct,
  openQuoteModal,
  closeQuoteModal,
  lineQrModalOpen,
  openLineModal,
  closeLineModal,
  lineUrl,
  facebookUrl
} = useSiteData()
const { trackLeadConversion } = useTracking()

const social = computed(() => siteState.value?.social || {})
const lineHandle = computed(() => social.value?.line_oa?.handle_or_url || '@csf.co.th')

const copied = ref(false)
function copyLineId() {
  if (import.meta.client) {
    navigator.clipboard.writeText(lineHandle.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  }
}

const form = reactive({
  customer_name: '',
  company_name: '',
  phone: '',
  email: '',
  line_id: '',
  message: ''
})
const modalFiles = ref<File[]>([])
const submitting = ref(false)
const errorMsg = ref('')
const submittedRef = ref('')
const submittedOaChatUrl = ref('')

function onModalFileSelect(ev: Event) {
  const input = ev.target as HTMLInputElement
  if (input.files?.length) {
    for (const f of Array.from(input.files)) {
      if (modalFiles.value.length < 5) modalFiles.value.push(f)
    }
  }
  input.value = ''
}

watch(quoteModalProduct, prod => {
  submittedRef.value = ''
  submittedOaChatUrl.value = ''
  errorMsg.value = ''
  if (prod) {
    form.message = `สนใจขอใบเสนอราคาสินค้า รุ่น ${prod.sku} (${prod.name}) จำนวน ... ชุด`
  }
})

async function submitQuickQuote() {
  submitting.value = true
  errorMsg.value = ''
  try {
    const fd = new FormData()
    fd.append('customer_name', form.customer_name)
    fd.append('company_name', form.company_name)
    fd.append('phone', form.phone)
    fd.append('email', form.email)
    fd.append('line_id', form.line_id)
    fd.append(
      'subject',
      quoteModalProduct.value
        ? `ขอใบเสนอราคา ${quoteModalProduct.value.sku} — ${quoteModalProduct.value.name}`
        : 'ขอใบเสนอราคาด่วนจากหน้าเว็บไซต์'
    )
    fd.append('message', form.message)
    if (quoteModalProduct.value?.id) fd.append('product_id', String(quoteModalProduct.value.id))
    if (quoteModalProduct.value?.sku) fd.append('product_sku', quoteModalProduct.value.sku)
    fd.append('source_channel', 'website_modal')
    for (const file of modalFiles.value) {
      fd.append('files', file)
    }

    const res = await $fetch<any>('/api/inquiries', {
      method: 'POST',
      body: fd
    })
    submittedRef.value = res.ref_code
    submittedOaChatUrl.value = res.company_line_oa?.oa_chat_url || ''
    trackLeadConversion({
      refCode: res.ref_code,
      source: 'quick_quote_modal',
      sku: quoteModalProduct.value?.sku,
      hasAttachments: modalFiles.value.length > 0
    })

    form.customer_name = ''
    form.company_name = ''
    form.phone = ''
    form.email = ''
    form.line_id = ''
    form.message = ''
    modalFiles.value = []
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
  } finally {
    submitting.value = false
  }
}

function resetAndClose() {
  submittedRef.value = ''
  closeQuoteModal()
}
</script>
