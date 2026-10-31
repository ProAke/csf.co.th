<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900">จัดการฐานข้อมูล MariaDB &amp; สำรองข้อมูล (.SQL)</h2>
        <p class="text-xs text-slate-500">ตรวจสอบสถานะการเชื่อมต่อ ทดสอบเซิร์ฟเวอร์ MariaDB และส่งออกไฟล์ SQL ฉบับสมบูรณ์สำหรับ `pacific_csfnuxt`</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          @click="testEnvConnection"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
        >
          <span>ทดสอบค่าใน .env ทันที</span>
        </button>
        <button
          type="button"
          @click="downloadSqlDump"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition shadow-sm"
        >
          <Download class="w-4 h-4" />
          <span>ดาวน์โหลด MariaDB Dump (.sql)</span>
        </button>
      </div>
    </div>

    <div v-if="dbInfo" class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h3 class="font-bold text-slate-900">สถานะเอนจินปัจจุบัน</h3>
        <span
          v-if="envCfg"
          class="px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-[11px] font-mono font-bold text-sky-800"
        >
          .env Target: {{ envCfg.user }}@{{ envCfg.host }}:{{ envCfg.port }}/{{ envCfg.database }}
          {{ envCfg.hasPassword ? '(Password Configured)' : '(No Password)' }}
        </span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div class="text-xs text-slate-400">Active Driver</div>
          <div class="font-mono font-bold text-slate-900 mt-0.5">{{ dbInfo.engine }}</div>
        </div>
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2">
          <div class="text-xs text-slate-400">Connection Endpoint</div>
          <div class="font-mono font-bold text-sky-700 mt-0.5">{{ dbInfo.hostInfo }}</div>
        </div>
      </div>
      <p class="text-xs text-slate-600 leading-relaxed">{{ dbInfo.connectionNote }}</p>
    </div>

    <!-- MariaDB Live Connection Tester -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div>
        <h3 class="font-bold text-slate-900">ทดสอบการเชื่อมต่อเซิร์ฟเวอร์ MariaDB (mysql2/promise)</h3>
        <p class="text-xs text-slate-500">
          หากเว้นช่อง Password ว่างไว้ ระบบจะใช้รหัสผ่านจากไฟล์ <code class="font-mono bg-slate-100 px-1.5 py-0.5 rounded">.env</code> บนเซิร์ฟเวอร์โดยอัตโนมัติ (ไม่แสดงรหัสผ่านออกสู่หน้าจอเพื่อความปลอดภัย)
        </p>
      </div>

      <form @submit.prevent="runTest" class="grid grid-cols-1 sm:grid-cols-6 gap-3 text-sm">
        <input v-model="conn.host" required placeholder="Host (localhost)" class="px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs" />
        <input v-model.number="conn.port" type="number" placeholder="3360" class="px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs" />
        <input v-model="conn.user" required placeholder="User" class="px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs" />
        <input v-model="conn.database" required placeholder="Database" class="px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs" />
        <input v-model="conn.password" type="password" placeholder="Password (เว้นว่าง=ใช้ค่า .env)" class="px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs" />
        <button type="submit" class="px-4 py-2 rounded-xl bg-csf-navy hover:bg-sky-700 text-white text-xs font-bold">
          ทดสอบเชื่อมต่อ
        </button>
      </form>

      <div
        v-if="testMsg"
        class="p-3.5 rounded-xl text-xs font-semibold"
        :class="testOk ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'"
      >
        {{ testMsg }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download } from 'lucide-vue-next'

definePageMeta({ layout: 'office' })
useHead({ title: 'ฐานข้อมูล MariaDB (Database Manager)' })

const { adminFetch } = useAdminAuth()
const dbInfo = ref<any>(null)
const envCfg = ref<any>(null)
const testMsg = ref('')
const testOk = ref(false)

const conn = reactive({
  host: 'localhost',
  port: 3360,
  user: 'pacific_csfnuxt',
  database: 'pacific_csfnuxt',
  password: ''
})

onMounted(async () => {
  const res = await adminFetch<any>('/api/office/database/test', { method: 'POST', body: {} })
  dbInfo.value = res.status
  envCfg.value = res.configured
  if (res.configured) {
    conn.host = res.configured.host || 'localhost'
    conn.port = res.configured.port || 3360
    conn.user = res.configured.user || 'pacific_csfnuxt'
    conn.database = res.configured.database || 'pacific_csfnuxt'
  }
})

async function testEnvConnection() {
  testMsg.value = 'กำลังทดสอบเชื่อมต่อ MariaDB ด้วยค่าจากไฟล์ .env...'
  const res = await adminFetch<{ ok: boolean; message: string }>('/api/office/database/test', {
    method: 'POST',
    body: { useEnv: true }
  })
  testOk.value = res.ok
  testMsg.value = res.message
}

async function runTest() {
  testMsg.value = 'กำลังเชื่อมต่อไปยังเซิร์ฟเวอร์ MariaDB...'
  const res = await adminFetch<{ ok: boolean; message: string }>('/api/office/database/test', {
    method: 'POST',
    body: conn
  })
  testOk.value = res.ok
  testMsg.value = res.message
}

async function downloadSqlDump() {
  const sql = await adminFetch<string>('/api/office/database/export')
  if (import.meta.client) {
    const blob = new Blob([sql], { type: 'application/sql;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pacific_csfnuxt_mariadb_dump.sql'
    a.click()
    URL.revokeObjectURL(url)
  }
}
</script>
