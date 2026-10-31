<template>
  <div>
    <!-- Header -->
    <section class="bg-csf-navy text-white py-12 lg:py-16 relative overflow-hidden">
      <div class="tech-grid-bg absolute inset-0 pointer-events-none"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <span class="text-xs font-bold uppercase tracking-widest text-sky-400">CONTACT US &amp; QUOTATION</span>
        <h1 class="mt-1.5 text-3xl sm:text-4xl font-extrabold">ติดต่อเรา / ขอใบเสนอราคาองค์กร</h1>
        <p class="mt-2 text-slate-300 max-w-2xl text-sm sm:text-base">
          ผู้ประกอบการและหน่วยงานสามารถส่งรายละเอียดโครงการ แนบไฟล์เอกสาร TOR / BOQ / สเปกสินค้า และเชื่อมต่อกับ LINE Official Account ของบริษัทได้โดยตรง
        </p>
      </div>
    </section>

    <section class="py-14 bg-slate-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <!-- Left Info & Social Channels -->
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <div>
              <h2 class="text-xl font-extrabold text-slate-900">{{ settings.company_name_th || 'บริษัท ซีเอสเอฟ จำกัด' }}</h2>
              <p class="text-xs text-slate-500 font-mono mt-0.5">
                เลขประจำตัวผู้เสียภาษี: {{ settings.tax_id || '0105560106452 (สำนักงานใหญ่)' }}
              </p>
            </div>

            <div class="space-y-4 text-sm">
              <div class="flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                  <MapPin class="w-4 h-4" />
                </div>
                <div>
                  <div class="font-bold text-slate-900">สถานที่ตั้งสำนักงานใหญ่</div>
                  <p class="text-slate-600 leading-relaxed mt-0.5">{{ settings.address_th }}</p>
                  <p class="text-xs text-slate-400 mt-1">{{ settings.address_en }}</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                  <Clock class="w-4 h-4" />
                </div>
                <div>
                  <div class="font-bold text-slate-900">เวลาทำการ</div>
                  <p class="text-slate-600 mt-0.5">{{ settings.working_hours || 'จันทร์ – ศุกร์ เวลา 09:00 – 17:00 น.' }}</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                  <Phone class="w-4 h-4" />
                </div>
                <div>
                  <div class="font-bold text-slate-900">โทรศัพท์สายตรงฝ่ายขาย</div>
                  <a :href="`tel:${settings.phone_primary || '081-308-9678'}`" class="font-mono text-base font-bold text-sky-700 hover:underline">
                    {{ settings.phone_primary || '081-308-9678' }}
                  </a>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                  <Mail class="w-4 h-4" />
                </div>
                <div class="space-y-1">
                  <div class="font-bold text-slate-900">อีเมลติดต่อ</div>
                  <div class="text-slate-600">
                    ฝ่ายขาย:
                    <a :href="`mailto:${settings.email_sales || 'sales@csf.co.th'}`" class="text-sky-700 font-medium hover:underline">
                      {{ settings.email_sales || 'sales@csf.co.th' }}
                    </a>
                  </div>
                  <div class="text-slate-600">
                    ข้อมูลทั่วไป:
                    <a :href="`mailto:${settings.email_info || 'info@csf.co.th'}`" class="text-sky-700 font-medium hover:underline">
                      {{ settings.email_info || 'info@csf.co.th' }}
                    </a>
                  </div>
                  <div v-if="settings.email_alt" class="text-slate-500 text-xs">สำรอง: {{ settings.email_alt }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Direct LINE OA & Facebook Cards (Dynamic from Backoffice Config) -->
          <div id="social-connect" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              v-if="social?.line_oa?.is_enabled !== false"
              type="button"
              @click="openLineModal()"
              class="p-5 rounded-2xl bg-[#06C755] hover:bg-[#05b34c] text-white text-left space-y-2 transition shadow-sm"
            >
              <MessageCircle class="w-6 h-6" />
              <div class="font-bold text-sm">{{ social?.line_oa?.display_name || 'LINE Official Account' }}</div>
              <div class="text-xs text-emerald-50 font-mono">{{ lineHandle }}</div>
              <div class="text-[11px] text-white/90 pt-1">คลิกสแกน QR / เชื่อมต่อ LINE OA →</div>
            </button>

            <a
              v-if="social?.facebook?.is_enabled !== false"
              :href="facebookUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="p-5 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-left space-y-2 transition shadow-sm block"
            >
              <Globe class="w-6 h-6" />
              <div class="font-bold text-sm">Facebook Official Page</div>
              <div class="text-xs text-blue-100 truncate">{{ social?.facebook?.display_name || 'CSF Technology Touch' }}</div>
              <div class="text-[11px] text-white/90 pt-1">ทักแชท Messenger →</div>
            </a>
          </div>
        </div>

        <!-- Right Contact / RFQ Form with Document Upload & LINE OA Connect -->
        <div class="lg:col-span-7">
          <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
            <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900">ส่งข้อความติดต่อ / ขอใบเสนอราคา</h2>
            <p class="text-sm text-slate-500 mt-1">
              รองรับการแนบไฟล์เอกสารโครงการ (PDF, รูปภาพ, Excel, Word, PowerPoint) พร้อมเชื่อมโยง LINE ID เข้ากับ LINE OA บริษัทโดยอัตโนมัติ
            </p>

            <!-- Submission Success + Instant LINE OA Handshake -->
            <div v-if="successData" class="mt-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4">
              <div class="flex items-center gap-2 text-emerald-700 font-bold text-base">
                <CheckCircle2 class="w-5 h-5" />
                <span>บันทึกข้อมูล เอกสารแนบ และแจ้งเตือนเข้า LINE OA บริษัทเรียบร้อยแล้ว!</span>
              </div>

              <p class="text-sm text-slate-700">
                รหัสอ้างอิงของคุณคือ
                <strong class="font-mono text-emerald-900 bg-white px-2.5 py-0.5 rounded border border-emerald-200">
                  {{ successData.ref_code }}
                </strong>
                ทีมวิศวกรและฝ่ายขายจะติดต่อกลับตามข้อมูลและ LINE ID ที่ท่านระบุโดยเร็วที่สุด
              </p>

              <!-- Uploaded Files Summary -->
              <div v-if="successData.attachments?.length" class="bg-white rounded-xl p-3.5 border border-emerald-200 space-y-1.5">
                <div class="text-xs font-bold text-slate-700">เอกสารแนบที่บันทึกเข้าสู่ระบบเรียบร้อย ({{ successData.attachments.length }} ไฟล์):</div>
                <ul class="space-y-1 text-xs text-slate-600">
                  <li v-for="att in successData.attachments" :key="att.url" class="flex items-center gap-2">
                    <span class="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-mono text-[10px] font-bold">{{ att.ext }}</span>
                    <span class="truncate font-medium">{{ att.name }}</span>
                  </li>
                </ul>
              </div>

              <!-- Connect with Company LINE OA Immediately -->
              <div
                v-if="successData.company_line_oa?.enabled"
                class="bg-white rounded-2xl p-4 border border-[#06C755]/30 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div class="space-y-1 text-center sm:text-left">
                  <div class="text-xs font-extrabold text-[#059669] uppercase tracking-wider">เชื่อมต่อกับ LINE OA บริษัทต่อเนื่องทันที</div>
                  <div class="text-sm font-bold text-slate-900">
                    {{ successData.company_line_oa.display_name }} ({{ successData.company_line_oa.handle }})
                  </div>
                  <p class="text-xs text-slate-500">กดปุ่มเพื่อทักแชท LINE OA พร้อมส่งรหัสอ้างอิง {{ successData.ref_code }} อัตโนมัติ</p>
                </div>

                <div class="flex flex-wrap justify-center gap-2 shrink-0">
                  <a
                    :href="successData.company_line_oa.oa_chat_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold shadow-sm transition"
                  >
                    <MessageCircle class="w-4 h-4" />
                    <span>ทักแชท LINE OA บริษัท</span>
                  </a>
                  <button
                    type="button"
                    @click="openLineModal()"
                    class="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                  >
                    แสดง QR Code
                  </button>
                </div>
              </div>

              <button
                type="button"
                @click="successData = null"
                class="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900"
              >
                ส่งข้อความ / เอกสารเพิ่มเติมอีกครั้ง
              </button>
            </div>

            <form v-else @submit.prevent="submitContactForm" class="mt-6 space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อ - นามสกุล *</label>
                  <input
                    v-model="form.customer_name"
                    required
                    type="text"
                    placeholder="ระบุชื่อผู้ติดต่อ"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">บริษัท / หน่วยงาน / ร้านค้า</label>
                  <input
                    v-model="form.company_name"
                    type="text"
                    placeholder="ระบุชื่อองค์กร (ถ้ามี)"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ *</label>
                  <input
                    v-model="form.phone"
                    required
                    type="tel"
                    placeholder="08X-XXX-XXXX"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">อีเมล</label>
                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="email@company.com"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <!-- Highlighted LINE ID <-> Company LINE OA Connect Box -->
              <div class="p-4 rounded-2xl bg-[#06C755]/[0.06] border border-[#06C755]/25 space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-lg bg-[#06C755] text-white flex items-center justify-center">
                      <MessageCircle class="w-3.5 h-3.5" />
                    </span>
                    <span class="text-xs font-extrabold text-slate-900">
                      เชื่อมต่อผ่าน LINE (เชื่อมโยงกับ LINE OA บริษัท: <span class="font-mono text-[#059669]">{{ lineHandle }}</span>)
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <a
                      :href="lineUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#06C755] hover:bg-[#05b34c] text-white text-[11px] font-bold transition"
                    >
                      <span>+ แอด LINE OA บริษัท</span>
                    </a>
                    <button
                      type="button"
                      @click="openLineModal()"
                      class="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-800 text-[11px] font-semibold transition"
                    >
                      ดู QR Code
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">
                    LINE ID ของท่าน (เพื่อให้ทีมขายแอดกลับและส่งใบเสนอราคาผ่าน LINE OA)
                  </label>
                  <input
                    v-model="form.line_id"
                    type="text"
                    placeholder="ระบุ LINE ID หรือเบอร์โทรที่ผูกกับ LINE ของท่าน"
                    class="w-full px-4 py-2.5 rounded-xl border border-emerald-300 bg-white text-sm focus:ring-2 focus:ring-[#06C755] outline-none"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">หัวข้อเรื่องติดต่อ *</label>
                <input
                  v-model="form.subject"
                  required
                  type="text"
                  placeholder="เช่น ขอใบเสนอราคาอุปกรณ์ระบบเสียง / กล้องวงจรปิด / ส่งเอกสาร BOQ ประเมินราคา"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">รายละเอียดข้อความ / รหัสสินค้าและจำนวน *</label>
                <textarea
                  v-model="form.message"
                  required
                  rows="4"
                  placeholder="ระบุรายละเอียดความต้องการ รุ่นสินค้า หรือเงื่อนไขโครงการ..."
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                ></textarea>
              </div>

              <!-- Document Attachments Dropzone (PDF, JPEG, PNG, Excel, Word, PowerPoint) -->
              <div class="space-y-2.5">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <label class="block text-xs font-bold text-slate-700">
                    แนบเอกสารประกอบ (สูงสุด 5 ไฟล์ • ไม่เกิน 20 MB/ไฟล์)
                  </label>
                  <div class="flex flex-wrap gap-1">
                    <span class="px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">PDF</span>
                    <span class="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold">JPEG / PNG</span>
                    <span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">Excel</span>
                    <span class="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">Word</span>
                    <span class="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">PowerPoint</span>
                  </div>
                </div>

                <label
                  @dragover.prevent="dragging = true"
                  @dragleave.prevent="dragging = false"
                  @drop.prevent="handleDrop"
                  class="cursor-pointer flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed transition text-center"
                  :class="
                    dragging
                      ? 'border-sky-500 bg-sky-50/70'
                      : 'border-slate-300 hover:border-sky-400 bg-slate-50/60 hover:bg-sky-50/30'
                  "
                >
                  <Paperclip class="w-6 h-6 text-sky-600" />
                  <div class="text-xs font-bold text-slate-700">
                    คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                  </div>
                  <div class="text-[11px] text-slate-500">
                    รองรับไฟล์ <strong>.pdf, .jpg, .jpeg, .png, .xls, .xlsx, .csv, .doc, .docx, .ppt, .pptx</strong> (เช่น ใบ BOQ, TOR, แปลนติดตั้ง, รูปหน้างาน)
                  </div>
                  <input
                    type="file"
                    multiple
                    :accept="ACCEPTED_FILE_TYPES"
                    class="hidden"
                    @change="handleFileInput"
                  />
                </label>

                <!-- Selected Files List -->
                <div v-if="selectedFiles.length" class="space-y-1.5 pt-1">
                  <div
                    v-for="(file, idx) in selectedFiles"
                    :key="`${file.name}-${idx}`"
                    class="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div class="flex items-center gap-2.5 min-w-0">
                      <span
                        class="px-2 py-0.5 rounded font-mono text-[10px] font-extrabold uppercase shrink-0"
                        :class="badgeClassForFile(file.name)"
                      >
                        {{ getFileExt(file.name) }}
                      </span>
                      <span class="font-semibold text-slate-800 truncate">{{ file.name }}</span>
                      <span class="text-slate-400 shrink-0">({{ formatSize(file.size) }})</span>
                    </div>
                    <button
                      type="button"
                      @click="removeFile(idx)"
                      class="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition shrink-0"
                      title="นำไฟล์ออก"
                    >
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Honeypot Anti-Bot Field (Hidden from real users) -->
              <div class="hidden" aria-hidden="true">
                <input v-model="honeypot" type="text" name="website_url_hp" tabindex="-1" autocomplete="off" />
              </div>

              <!-- Server-Verified Anti-Spam Math Check -->
              <div class="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
                <div class="flex items-center gap-2.5">
                  <span class="text-xs font-semibold text-slate-600">ยืนยันตัวตน: {{ numA }} + {{ numB }} =</span>
                  <input
                    v-model="mathAnswer"
                    required
                    type="number"
                    class="w-20 px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold text-center focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  :disabled="submitting"
                  class="px-7 py-3.5 rounded-xl bg-csf-navy hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm transition shadow-sm"
                >
                  {{ submitting ? 'กำลังอัปโหลดและส่งข้อมูล...' : 'ส่งข้อมูลติดต่อฝ่ายขาย' }}
                </button>
              </div>

              <p v-if="errText" class="text-xs text-red-600 bg-red-50 px-3.5 py-2.5 rounded-xl">{{ errText }}</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  CheckCircle2,
  Clock,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Paperclip,
  Phone,
  X
} from 'lucide-vue-next'

useHead({ title: 'ติดต่อเรา / ขอใบเสนอราคา (Contacts)' })

const ACCEPTED_FILE_TYPES =
  '.pdf,.jpg,.jpeg,.png,.xls,.xlsx,.csv,.doc,.docx,.ppt,.pptx,application/pdf,image/jpeg,image/png,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation'

const ALLOWED_EXT_SET = new Set(['pdf', 'jpg', 'jpeg', 'png', 'xls', 'xlsx', 'csv', 'doc', 'docx', 'ppt', 'pptx'])

const { siteState, openLineModal, lineUrl, facebookUrl } = useSiteData()
const { trackLeadConversion } = useTracking()

const settings = computed(() => siteState.value?.settings || {})
const social = computed(() => siteState.value?.social || {})
const lineHandle = computed(() => social.value?.line_oa?.handle_or_url || '@csf.co.th')

const numA = ref(11)
const numB = ref(4)
const challengeToken = ref('')
const mathAnswer = ref('')
const honeypot = ref('')

async function loadChallenge() {
  try {
    const ch = await $fetch<{ a: number; b: number; token: string }>('/api/security/challenge')
    numA.value = ch.a
    numB.value = ch.b
    challengeToken.value = ch.token
  } catch {
    // fallback
  }
}

onMounted(() => {
  loadChallenge()
})

const form = reactive({
  customer_name: '',
  company_name: '',
  phone: '',
  email: '',
  line_id: '',
  subject: '',
  message: ''
})

const selectedFiles = ref<File[]>([])
const dragging = ref(false)
const submitting = ref(false)
const errText = ref('')
const successData = ref<any | null>(null)

function getFileExt(name: string): string {
  const parts = name.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'file'
}

function badgeClassForFile(name: string): string {
  const ext = getFileExt(name)
  if (ext === 'pdf') return 'bg-red-100 text-red-700'
  if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return 'bg-emerald-100 text-emerald-800'
  if (ext === 'doc' || ext === 'docx') return 'bg-blue-100 text-blue-800'
  if (ext === 'ppt' || ext === 'pptx') return 'bg-amber-100 text-amber-800'
  return 'bg-sky-100 text-sky-800'
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function addFiles(list: FileList | File[]) {
  errText.value = ''
  for (const f of Array.from(list)) {
    const ext = getFileExt(f.name)
    if (!ALLOWED_EXT_SET.has(ext)) {
      errText.value = `ไฟล์ "${f.name}" ไม่รองรับ (รองรับเฉพาะ PDF, JPEG, PNG, Excel, Word และ PowerPoint)`
      continue
    }
    if (f.size > 20 * 1024 * 1024) {
      errText.value = `ไฟล์ "${f.name}" มีขนาดเกิน 20 MB`
      continue
    }
    if (selectedFiles.value.length >= 5) {
      errText.value = 'แนบเอกสารได้สูงสุด 5 ไฟล์ต่อครั้ง'
      break
    }
    selectedFiles.value.push(f)
  }
}

function handleFileInput(ev: Event) {
  const input = ev.target as HTMLInputElement
  if (input.files?.length) {
    addFiles(input.files)
  }
  input.value = ''
}

function handleDrop(ev: DragEvent) {
  dragging.value = false
  if (ev.dataTransfer?.files?.length) {
    addFiles(ev.dataTransfer.files)
  }
}

function removeFile(idx: number) {
  selectedFiles.value.splice(idx, 1)
}

async function submitContactForm() {
  errText.value = ''
  if (Number(mathAnswer.value) !== numA.value + numB.value) {
    errText.value = `คำตอบการบวกเลขไม่ถูกต้อง (กรุณากรอก ${numA.value + numB.value})`
    return
  }

  submitting.value = true
  try {
    if (!challengeToken.value) {
      await loadChallenge()
    }
    const fd = new FormData()
    fd.append('customer_name', form.customer_name)
    fd.append('company_name', form.company_name)
    fd.append('phone', form.phone)
    fd.append('email', form.email)
    fd.append('line_id', form.line_id)
    fd.append('subject', form.subject)
    fd.append('message', form.message)
    fd.append('source_channel', 'contact_page')
    fd.append('website_url_hp', honeypot.value)
    fd.append('challenge_token', challengeToken.value)
    fd.append('challenge_answer', String(mathAnswer.value))

    for (const file of selectedFiles.value) {
      fd.append('files', file)
    }

    const res = await $fetch<any>('/api/inquiries', {
      method: 'POST',
      body: fd
    })

    successData.value = res
    trackLeadConversion({
      refCode: res.ref_code,
      source: 'contact_page',
      hasAttachments: selectedFiles.value.length > 0
    })

    form.customer_name = ''
    form.company_name = ''
    form.phone = ''
    form.email = ''
    form.line_id = ''
    form.subject = ''
    form.message = ''
    selectedFiles.value = []
    mathAnswer.value = ''
    await loadChallenge()
  } catch (err: any) {
    errText.value = err?.data?.statusMessage || 'ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง'
    await loadChallenge()
  } finally {
    submitting.value = false
  }
}
</script>
