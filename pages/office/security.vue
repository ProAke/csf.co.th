<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900">ศูนย์ควบคุมความปลอดภัยระบบ (Security &amp; Audit Center)</h2>
        <p class="text-xs text-slate-500">
          ตรวจสอบมาตรการป้องกันการเจาะระบบ บันทึกการเข้าถึงผิดปกติ (Intrusion &amp; Scanner Logs) และเปลี่ยนรหัสผ่านผู้ดูแลระบบ
        </p>
      </div>
      <button
        type="button"
        @click="loadSecurity"
        class="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 self-start sm:self-auto"
      >
        รีเฟรชข้อมูลล่าสุด
      </button>
    </div>

    <!-- Top Security Metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-1">
        <div class="text-xs font-bold text-emerald-700">สถานะเกราะป้องกัน (Hardening)</div>
        <div class="text-2xl font-extrabold text-slate-900">
          {{ activeCheckCount }} / {{ securityData.checks.length }} ชั้น
        </div>
        <div class="text-[11px] text-emerald-600 font-semibold">เปิดใช้งานป้องกันเต็มรูปแบบ</div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <div class="text-xs font-bold text-slate-500">บล็อกบอทสแกน /admin &amp; /wp-admin</div>
        <div class="text-2xl font-extrabold text-amber-600">{{ securityData.stats.blockedScanners }}</div>
        <div class="text-[11px] text-slate-400">ตอบกลับ 404 ซ่อนเส้นทาง /office</div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <div class="text-xs font-bold text-slate-500">ล็อกอินผิดพลาด / Brute-Force</div>
        <div class="text-2xl font-extrabold text-red-600">{{ securityData.stats.failedLogins }}</div>
        <div class="text-[11px] text-slate-400">จำกัดสูงสุด 5 ครั้ง / 15 นาที</div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <div class="text-xs font-bold text-slate-500">บล็อกไฟล์แนบปลอมแปลง</div>
        <div class="text-2xl font-extrabold text-sky-700">{{ securityData.stats.rejectedUploads }}</div>
        <div class="text-[11px] text-slate-400">ตรวจด้วย Magic-Byte Signature</div>
      </div>
    </div>

    <!-- Main Grid: 10 Security Layers + Password Change -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- 10-Layer Hardening Checklist -->
      <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-sm font-extrabold text-slate-900">มาตรการรักษาความปลอดภัยที่ทำงานอยู่จริง (10 Layers)</h3>
          <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">OWASP Hardened</span>
        </div>

        <div class="space-y-2.5">
          <div
            v-for="item in securityData.checks"
            :key="item.id"
            class="p-3.5 rounded-xl border flex items-start gap-3"
            :class="
              item.status === 'active'
                ? 'bg-slate-50/70 border-slate-200'
                : 'bg-amber-50/50 border-amber-200'
            "
          >
            <span
              class="mt-0.5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0"
              :class="
                item.status === 'active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              "
            >
              {{ item.status === 'active' ? 'ACTIVE' : 'ENV TIP' }}
            </span>
            <div class="space-y-0.5 min-w-0">
              <div class="text-xs font-bold text-slate-900">{{ item.title }}</div>
              <p class="text-[11px] text-slate-600 leading-relaxed">{{ item.detail }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Password Change -->
      <div class="lg:col-span-5 space-y-6">
        <form @submit.prevent="changePassword" class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div class="border-b border-slate-100 pb-3">
            <h3 class="text-sm font-extrabold text-slate-900">เปลี่ยนรหัสผ่านผู้ดูแลระบบ (/office)</h3>
            <p class="text-[11px] text-slate-500 mt-0.5">
              เมื่อเปลี่ยนรหัสผ่านสำเร็จ ระบบจะเพิกถอนเซสชันเก่าบนเครื่องอื่นทั้งหมดทันทีอัตโนมัติ
            </p>
          </div>

          <div
            v-if="pwdSuccess"
            class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800"
          >
            ✓ เปลี่ยนรหัสผ่านและออกเซสชันใหม่เรียบร้อยแล้ว!
          </div>

          <div
            v-if="pwdError"
            class="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700"
          >
            {{ pwdError }}
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">รหัสผ่านปัจจุบัน *</label>
            <input
              v-model="pwdForm.current_password"
              required
              type="password"
              autocomplete="current-password"
              class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร + ตัวเลข/สัญลักษณ์) *</label>
            <input
              v-model="pwdForm.new_password"
              required
              type="password"
              autocomplete="new-password"
              class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">ยืนยันรหัสผ่านใหม่อีกครั้ง *</label>
            <input
              v-model="pwdForm.confirm_password"
              required
              type="password"
              autocomplete="new-password"
              class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <button
            type="submit"
            :disabled="savingPwd"
            class="w-full py-2.5 rounded-xl bg-csf-navy hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm"
          >
            {{ savingPwd ? 'กำลังเข้ารหัสและบันทึก...' : 'อัปเดตรหัสผ่านใหม่ทันที' }}
          </button>
        </form>

        <!-- Production Deployment Checklist Card -->
        <div class="bg-slate-900 text-slate-200 rounded-2xl p-5 space-y-2.5 text-xs">
          <div class="font-extrabold text-sky-300">ข้อแนะนำเพิ่มเติมเมื่อขึ้นเซิร์ฟเวอร์จริง (uat.csf.co.th / www.csf.co.th)</div>
          <ul class="space-y-1.5 text-[11px] text-slate-300 list-disc pl-4 leading-relaxed">
            <li>ตั้งค่า <code class="text-amber-300">ADMIN_JWT_SECRET</code> ในไฟล์ <code class="text-amber-300">.env</code> เป็นรหัสสุ่มยาว 32+ ตัวอักษร</li>
            <li>เปลี่ยนรหัสผ่านเริ่มต้น (<code class="text-amber-300">csf@2026</code>) จากฟอร์มด้านบนทันทีหลังเปิดใช้งานจริง</li>
            <li>เปิดใช้งาน SSL/HTTPS (Let's Encrypt / Reverse Proxy) เพื่อให้ระบบส่ง Header <code class="text-emerald-300">Strict-Transport-Security</code> และคุกกี้ <code class="text-emerald-300">Secure</code> อัตโนมัติ</li>
            <li>อย่าเปิดพอร์ต MariaDB (<code class="text-amber-300">3306</code>) ออกสู่อินเทอร์เน็ตภายนอก ให้เชื่อมต่อเฉพาะภายในเครือข่าย Docker/Localhost</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Real-Time Security Audit Logs -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 class="text-sm font-extrabold text-slate-900">
            บันทึกเหตุการณ์ความปลอดภัยล่าสุด (Security Audit &amp; Intrusion Logs)
          </h3>
          <p class="text-[11px] text-slate-500">
            บันทึกการล็อกอิน การสุ่มรหัสผ่าน การสแกนหา /admin หรือ /wp-admin และการปฏิเสธไฟล์อันตราย
          </p>
        </div>
        <button
          v-if="securityData.logs.length"
          type="button"
          @click="clearLogs"
          class="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-semibold text-slate-600 transition"
        >
          ล้างประวัติบันทึก
        </button>
      </div>

      <div v-if="!securityData.logs.length" class="p-10 text-center text-xs text-slate-400">
        ยังไม่มีบันทึกเหตุการณ์ผิดปกติในขณะนี้
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50 text-slate-600 border-b border-slate-200">
              <th class="py-3 px-4 font-bold">วัน-เวลา</th>
              <th class="py-3 px-4 font-bold">ระดับ</th>
              <th class="py-3 px-4 font-bold">ประเภทเหตุการณ์</th>
              <th class="py-3 px-4 font-bold">IP / ผู้กระทำ</th>
              <th class="py-3 px-4 font-bold">เส้นทาง</th>
              <th class="py-3 px-4 font-bold">รายละเอียด</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="log in securityData.logs" :key="log.id" class="hover:bg-slate-50/70">
              <td class="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">{{ log.created_at }}</td>
              <td class="py-2.5 px-4">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase"
                  :class="severityClass(log.severity)"
                >
                  {{ log.severity }}
                </span>
              </td>
              <td class="py-2.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">{{ log.event_type }}</td>
              <td class="py-2.5 px-4 font-mono text-[11px] text-slate-600">
                <div>{{ log.ip_address || '-' }}</div>
                <div v-if="log.actor" class="text-sky-700 font-semibold">{{ log.actor }}</div>
              </td>
              <td class="py-2.5 px-4 font-mono text-[11px] text-slate-500">{{ log.target_path || '-' }}</td>
              <td class="py-2.5 px-4 text-slate-700">{{ log.detail }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'office' })
useHead({ title: 'ความปลอดภัยระบบ (Security & Audit Center)' })

const { adminFetch } = useAdminAuth()

const securityData = reactive<{
  checks: Array<{ id: string; title: string; status: string; detail: string }>
  stats: {
    totalEvents: number
    blockedScanners: number
    failedLogins: number
    rejectedUploads: number
    lastLoginAt: string | null
  }
  logs: Array<Record<string, any>>
}>({
  checks: [],
  stats: {
    totalEvents: 0,
    blockedScanners: 0,
    failedLogins: 0,
    rejectedUploads: 0,
    lastLoginAt: null
  },
  logs: []
})

const activeCheckCount = computed(() => securityData.checks.length)

const pwdForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})
const savingPwd = ref(false)
const pwdSuccess = ref(false)
const pwdError = ref('')

function severityClass(sev: string) {
  if (sev === 'critical') return 'bg-red-100 text-red-700'
  if (sev === 'warn') return 'bg-amber-100 text-amber-800'
  return 'bg-emerald-100 text-emerald-800'
}

async function loadSecurity() {
  const res = await adminFetch<typeof securityData>('/api/office/security')
  securityData.checks = res.checks || []
  securityData.stats = res.stats || securityData.stats
  securityData.logs = res.logs || []
}

async function changePassword() {
  savingPwd.value = true
  pwdSuccess.value = false
  pwdError.value = ''
  try {
    await adminFetch('/api/office/security/password', {
      method: 'POST',
      body: pwdForm
    })
    pwdSuccess.value = true
    pwdForm.current_password = ''
    pwdForm.new_password = ''
    pwdForm.confirm_password = ''
    await loadSecurity()
  } catch (err: any) {
    pwdError.value = err?.data?.statusMessage || 'ไม่สามารถเปลี่ยนรหัสผ่านได้'
  } finally {
    savingPwd.value = false
  }
}

async function clearLogs() {
  await adminFetch('/api/office/security/logs', { method: 'DELETE' })
  await loadSecurity()
}

onMounted(() => {
  loadSecurity()
})
</script>
