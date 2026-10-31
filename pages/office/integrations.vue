<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-extrabold text-slate-900">ศูนย์เชื่อมต่อ LINE Official Account &amp; Facebook</h2>
      <p class="text-xs text-slate-500">
        ตั้งค่า Messaging API, Graph API, ระบบตอบสเปกสินค้าอัตโนมัติ (LINE Flex), แจ้งเตือนใบขอราคา และทดสอบ Webhook แบบเรียลไทม์
      </p>
    </div>

    <div v-if="notice" class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between">
      <span>{{ notice }}</span>
      <button type="button" @click="notice = ''">✕</button>
    </div>

    <!-- Tabs -->
    <div class="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        @click="activeTab = t.id"
        class="px-4 py-2 rounded-xl text-xs font-bold transition"
        :class="activeTab === t.id ? 'bg-csf-navy text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-sky-300'"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- TAB 1: LINE OA Settings -->
    <div v-if="activeTab === 'line'" class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#06C755] text-white flex items-center justify-center font-extrabold text-xs">LINE</div>
          <div>
            <h3 class="font-bold text-slate-900">การเชื่อมต่อ LINE Official Account (Messaging API)</h3>
            <p class="text-xs text-slate-500">Webhook Endpoint: <code class="font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded">{{ webhookBase }}/api/webhooks/line</code></p>
          </div>
        </div>
        <label class="inline-flex items-center gap-2 text-xs font-bold text-emerald-700">
          <input v-model="lineForm.is_enabled" type="checkbox" class="rounded text-emerald-600" />
          <span>เปิดใช้งาน LINE OA บนเว็บไซต์</span>
        </label>
      </div>

      <form @submit.prevent="saveIntegration(lineForm)" class="space-y-4 text-sm">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อบัญชีทางการ (Display Name)</label>
            <input v-model="lineForm.display_name" type="text" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">LINE OA ID (@handle หรือลิงก์เพิ่มเพื่อน)</label>
            <input v-model="lineForm.handle_or_url" type="text" placeholder="@csf.co.th" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-sm" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Channel ID (จาก LINE Developers)</label>
            <input v-model="lineForm.channel_id" type="text" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Channel Secret (ตรวจ X-Line-Signature)</label>
            <input v-model="lineForm.channel_secret" type="password" placeholder="เว้นว่างในโหมดทดสอบ หรือวาง Secret จริง" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Channel Access Token (Long-lived)</label>
            <input v-model="lineForm.access_token" type="password" placeholder="วาง Token เพื่อยิงเข้า LINE API จริง" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Target User ID / Group ID ฝ่ายขาย (รับแจ้งเตือนใบขอราคา)</label>
            <input v-model="lineForm.target_recipient_id" type="text" placeholder="Uxxxx... หรือ Cxxxx..." class="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs" />
          </div>
        </div>

        <AdminImageField
          v-model="lineForm.qr_code_url"
          label="รูปภาพ QR Code ของ LINE OA บริษัท (อัปโหลดเก็บในเซิร์ฟเวอร์ แสดงหน้าติดต่อเราและปุ่มลอย)"
          folder="brand"
          placeholder="/uploads/brand/line-qr.png (หากเว้นว่างระบบแสดงป้าย QR มาตรฐาน)"
        />

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">ข้อความต้อนรับอัตโนมัติ (Welcome / Auto-Reply Message)</label>
          <textarea v-model="lineForm.welcome_message" rows="2" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"></textarea>
        </div>

        <div class="flex flex-wrap gap-6 pt-1">
          <label class="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
            <input v-model="lineForm.auto_reply_enabled" type="checkbox" class="rounded text-emerald-600" />
            <span>ตอบสเปกสินค้าอัตโนมัติด้วย LINE Flex เมื่อลูกค้าพิมพ์รหัส SKU</span>
          </label>
          <label class="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
            <input v-model="lineForm.notify_on_inquiry" type="checkbox" class="rounded text-emerald-600" />
            <span>แจ้งเตือนเข้า LINE ทันทีเมื่อมีลูกค้าส่งฟอร์มขอใบเสนอราคา</span>
          </label>
        </div>

        <div class="pt-3 border-t border-slate-100 flex justify-end">
          <button type="submit" class="px-6 py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold">
            บันทึกการตั้งค่า LINE OA
          </button>
        </div>
      </form>
    </div>

    <!-- TAB 2: Facebook Settings -->
    <div v-if="activeTab === 'facebook'" class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center font-extrabold text-xs">FB</div>
          <div>
            <h3 class="font-bold text-slate-900">การเชื่อมต่อ Facebook Page, Messenger &amp; Pixel</h3>
            <p class="text-xs text-slate-500">Webhook Endpoint: <code class="font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded">{{ webhookBase }}/api/webhooks/facebook</code></p>
          </div>
        </div>
        <label class="inline-flex items-center gap-2 text-xs font-bold text-blue-700">
          <input v-model="fbForm.is_enabled" type="checkbox" class="rounded text-blue-600" />
          <span>เปิดใช้งานปุ่ม Facebook บนเว็บไซต์</span>
        </label>
      </div>

      <form @submit.prevent="saveIntegration(fbForm)" class="space-y-4 text-sm">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อเพจ Facebook</label>
            <input v-model="fbForm.display_name" type="text" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">ลิงก์เพจ Facebook / Messenger URL</label>
            <input v-model="fbForm.handle_or_url" type="text" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Facebook Page ID</label>
            <input v-model="fbForm.channel_id" type="text" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Webhook Verify Token</label>
            <input v-model="fbForm.verify_token" type="text" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Meta Pixel ID (วัดผลโฆษณา)</label>
            <input v-model="fbForm.pixel_id" type="text" placeholder="เช่น 123456789012345" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Page Access Token (สำหรับโพสต์เพจ &amp; ตอบแชท)</label>
            <input v-model="fbForm.access_token" type="password" placeholder="วาง Page Access Token จริงเมื่อใช้งานจริง" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">App Secret (ตรวจ X-Hub-Signature-256)</label>
            <input v-model="fbForm.channel_secret" type="password" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">ข้อความตอบกลับอัตโนมัติใน Messenger</label>
          <textarea v-model="fbForm.welcome_message" rows="2" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"></textarea>
        </div>

        <div class="flex flex-wrap gap-6 pt-1">
          <label class="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
            <input v-model="fbForm.auto_reply_enabled" type="checkbox" class="rounded text-blue-600" />
            <span>เปิดตอบกลับอัตโนมัติเมื่อลูกค้าทักแชท Messenger และสร้าง Lead ในระบบ</span>
          </label>
        </div>

        <div class="pt-3 border-t border-slate-100 flex justify-end">
          <button type="submit" class="px-6 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold">
            บันทึกการตั้งค่า Facebook
          </button>
        </div>
      </form>
    </div>

    <!-- TAB 3: Broadcast & Simulator -->
    <div v-if="activeTab === 'simulator'" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Simulator Box -->
      <div class="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <span class="text-[11px] font-bold uppercase tracking-wider text-sky-600">INTERACTIVE WEBHOOK TESTER</span>
          <h3 class="font-bold text-base text-slate-900">จำลองลูกค้าทักแชทจาก LINE OA หรือ Facebook</h3>
          <p class="text-xs text-slate-500 mt-0.5">
            ทดสอบระบบค้นหาสเปกสินค้าอัตโนมัติและการสร้างใบขอราคาลงฐานข้อมูลโดยไม่ต้องผูกโดเมนภายนอก
          </p>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">เลือกช่องทางที่จำลอง</label>
            <select v-model="simPlatform" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold">
              <option value="line_oa">LINE Official Account (รองรับ Flex Card สินค้า)</option>
              <option value="facebook">Facebook Messenger</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">ข้อความที่ลูกค้าพิมพ์เข้ามา</label>
            <input
              v-model="simText"
              type="text"
              class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            />
            <div class="flex flex-wrap gap-1.5 mt-2">
              <button
                v-for="sample in ['สนใจขอราคา DSP501', 'สเปกเครื่องบันทึก SN-NVR10/08E3/064NSH', 'ขอใบเสนอราคาแอมป์ MP60U 5 เครื่อง']"
                :key="sample"
                type="button"
                @click="simText = sample"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-100 text-[11px] font-medium text-slate-700"
              >
                "{{ sample }}"
              </button>
            </div>
          </div>

          <button
            type="button"
            @click="runWebhookSim"
            class="w-full py-2.5 rounded-xl bg-csf-navy hover:bg-sky-700 text-white text-xs font-bold transition"
          >
            ยิงทดสอบ Webhook และดูผลลัพธ์ทันที
          </button>
        </div>

        <!-- Visual Preview of Auto-Reply -->
        <div v-if="simResult" class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-emerald-700">✓ สร้าง Lead อัตโนมัติรหัส: {{ simResult.inquiry_ref }}</span>
            <NuxtLink to="/office/inquiries" class="text-sky-700 font-bold hover:underline">เปิดดูใน CRM →</NuxtLink>
          </div>

          <div v-if="simResult.matched_product" class="rounded-xl overflow-hidden border border-slate-300 bg-white max-w-xs mx-auto shadow">
            <div class="bg-csf-navy p-3 text-white">
              <div class="text-[10px] font-bold text-sky-400">CSF TECHNOLOGY TOUCH (FLEX PREVIEW)</div>
              <div class="font-mono font-bold text-sm">{{ simResult.matched_product.sku }}</div>
            </div>
            <div class="p-3 space-y-1.5 text-xs">
              <div class="font-bold text-slate-900">{{ simResult.matched_product.name }}</div>
              <div class="text-slate-500">{{ simResult.matched_product.subtitle }}</div>
              <div class="pt-1 text-emerald-700 font-bold">{{ simResult.matched_product.stock_status }}</div>
              <div class="text-sky-700 font-bold">{{ simResult.matched_product.price_display }}</div>
            </div>
          </div>
          <div v-else-if="simResult.auto_reply_preview?.text" class="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
            {{ simResult.auto_reply_preview.text }}
          </div>
        </div>
      </div>

      <!-- Broadcast Box -->
      <div class="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-600">MULTI-CHANNEL BROADCAST</span>
          <h3 class="font-bold text-base text-slate-900">ส่งประชาสัมพันธ์สินค้า / ข่าวสารออกสู่โซเชียล</h3>
          <p class="text-xs text-slate-500 mt-0.5">เลือกสินค้าจากแคตตาล็อกหรือพิมพ์ข้อความเพื่อ Broadcast เข้า LINE OA หรือเพจ Facebook</p>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">ช่องทางปลายทาง</label>
            <select v-model="bcPlatform" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold">
              <option value="line_oa">LINE Official Account Broadcast</option>
              <option value="facebook">Facebook Page Feed Post</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">แนบการ์ดสินค้า (ไม่บังคับ)</label>
            <select v-model="bcProductId" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm">
              <option value="">-- ส่งเฉพาะข้อความประกาศ --</option>
              <option v-for="p in products" :key="p.id" :value="String(p.id)">
                [{{ p.sku }}] {{ p.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">ข้อความประชาสัมพันธ์</label>
            <textarea
              v-model="bcMessage"
              rows="3"
              placeholder="เว้นว่างได้หากเลือกแนบสินค้า ระบบจะสร้างแคปชันให้อัตโนมัติ..."
              class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            ></textarea>
          </div>

          <button
            type="button"
            @click="sendBroadcast"
            class="w-full py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold transition"
          >
            ส่งเผยแพร่ทันที
          </button>
        </div>
      </div>

      <!-- Recent Social Logs Table -->
      <div class="lg:col-span-12 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-sm text-slate-900">ประวัติการรับ-ส่งข้อมูล LINE OA &amp; Facebook (Audit Logs)</h3>
          <button type="button" @click="loadData" class="text-xs font-bold text-sky-700 hover:underline">รีเฟรชข้อมูล</button>
        </div>
        <div class="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          <div v-for="log in logs" :key="log.id" class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <span
                  class="px-2 py-0.5 rounded font-bold uppercase text-[10px]"
                  :class="log.platform === 'line_oa' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'"
                >
                  {{ log.platform }}
                </span>
                <span class="font-mono text-slate-500">{{ log.direction }} • {{ log.event_type }}</span>
              </div>
              <p class="text-slate-800 font-medium">{{ log.summary }}</p>
            </div>
            <div class="font-mono text-[11px] text-slate-400 shrink-0">{{ log.status }} ({{ log.created_at }})</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'office' })
useHead({ title: 'ตั้งค่า LINE OA & Facebook (Integrations)' })

const config = useRuntimeConfig()
const { adminFetch } = useAdminAuth()

const tabs = [
  { id: 'line', label: '1. ตั้งค่า LINE Official Account' },
  { id: 'facebook', label: '2. ตั้งค่า Facebook Page & Pixel' },
  { id: 'simulator', label: '3. Broadcast & ทดสอบ Webhook สด' }
]
const activeTab = ref('line')
const notice = ref('')
const logs = ref<any[]>([])
const products = ref<any[]>([])

const webhookBase = computed(() => {
  if (import.meta.client) return window.location.origin
  return config.public.siteUrl || 'https://uat.csf.co.th'
})

const lineForm = reactive<any>({
  platform: 'line_oa',
  display_name: '',
  handle_or_url: '@csf.co.th',
  channel_id: '',
  channel_secret: '',
  access_token: '',
  verify_token: '',
  target_recipient_id: '',
  qr_code_url: '',
  pixel_id: '',
  auto_reply_enabled: true,
  notify_on_inquiry: true,
  auto_publish_content: true,
  welcome_message: '',
  is_enabled: true
})

const fbForm = reactive<any>({
  platform: 'facebook',
  display_name: '',
  handle_or_url: '',
  channel_id: '',
  channel_secret: '',
  access_token: '',
  verify_token: 'csf_fb_verify_2026',
  target_recipient_id: '',
  qr_code_url: '',
  pixel_id: '',
  auto_reply_enabled: true,
  notify_on_inquiry: true,
  auto_publish_content: true,
  welcome_message: '',
  is_enabled: true
})

const simPlatform = ref<'line_oa' | 'facebook'>('line_oa')
const simText = ref('สนใจขอราคา DSP501')
const simResult = ref<any>(null)

const bcPlatform = ref<'line_oa' | 'facebook'>('line_oa')
const bcProductId = ref('')
const bcMessage = ref('')

async function loadData() {
  const res = await adminFetch('/api/office/integrations')
  logs.value = res.logs || []
  products.value = res.products || []
  for (const row of res.integrations || []) {
    const mapped = {
      ...row,
      auto_reply_enabled: Boolean(row.auto_reply_enabled),
      notify_on_inquiry: Boolean(row.notify_on_inquiry),
      auto_publish_content: Boolean(row.auto_publish_content),
      is_enabled: Boolean(row.is_enabled)
    }
    if (row.platform === 'line_oa') Object.assign(lineForm, mapped)
    if (row.platform === 'facebook') Object.assign(fbForm, mapped)
  }
}

async function saveIntegration(payload: any) {
  await adminFetch('/api/office/integrations', {
    method: 'PUT',
    body: payload
  })
  const { fetchSite } = useSiteData()
  await fetchSite(true)
  notice.value = `บันทึกการตั้งค่า ${payload.platform === 'line_oa' ? 'LINE Official Account' : 'Facebook'} เรียบร้อยแล้ว!`
}

async function runWebhookSim() {
  const res = await adminFetch('/api/office/integrations/simulate', {
    method: 'POST',
    body: {
      platform: simPlatform.value,
      text: simText.value
    }
  })
  simResult.value = res
  await loadData()
}

async function sendBroadcast() {
  const res = await adminFetch<{ detail: string }>('/api/office/integrations/broadcast', {
    method: 'POST',
    body: {
      platform: bcPlatform.value,
      product_id: bcProductId.value ? Number(bcProductId.value) : null,
      message: bcMessage.value
    }
  })
  notice.value = res.detail
  bcMessage.value = ''
  await loadData()
}

onMounted(loadData)
</script>
