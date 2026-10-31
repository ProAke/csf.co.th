<template>
  <div class="min-h-screen bg-csf-navy tech-grid-bg flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
      <!-- Pure White Logo Header (Official CSF Logo on White Background Only) -->
      <div class="bg-white px-8 pt-8 pb-6 text-center space-y-2.5 border-b border-slate-200">
        <div class="flex justify-center">
          <BrandLogo variant="light" size="lg" :show-text="false" />
        </div>
        <h1 class="text-xl font-extrabold text-slate-900 pt-1">ระบบจัดการหลังบ้าน (Backoffice)</h1>
        <p class="text-xs text-slate-500">CSF Technology Touch • Protected Endpoint (/office)</p>
      </div>

      <form @submit.prevent="handleLogin" class="p-8 space-y-5 bg-white">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">ชื่อผู้ใช้งาน หรือ อีเมล</label>
          <input
            v-model="username"
            required
            type="text"
            autocomplete="username"
            placeholder="กรอกชื่อผู้ใช้งาน"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">รหัสผ่าน</label>
          <input
            v-model="password"
            required
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        <p v-if="errMsg" class="text-xs text-red-600 bg-red-50 border border-red-200 px-3.5 py-2.5 rounded-xl">
          {{ errMsg }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 rounded-xl bg-csf-navy hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm transition shadow-sm"
        >
          {{ loading ? 'กำลังตรวจสอบสิทธิ์...' : 'เข้าสู่ระบบจัดการเว็บไซต์ (/office)' }}
        </button>

        <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>🔒 ป้องกัน Brute-Force &amp; HttpOnly Cookie</span>
          <NuxtLink to="/" class="font-semibold text-slate-600 hover:text-sky-700">
            ← หน้าเว็บหลัก
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({
  title: 'เข้าสู่ระบบหลังบ้าน (/office/login)',
  meta: [{ name: 'robots', content: 'noindex, nofollow, noarchive' }]
})

const { login } = useAdminAuth()
const username = ref('')
const password = ref('')
const loading = ref(false)
const errMsg = ref('')

async function handleLogin() {
  loading.value = true
  errMsg.value = ''
  try {
    await login(username.value, password.value)
    await navigateTo('/office')
  } catch (err: any) {
    errMsg.value = err?.data?.statusMessage || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน'
  } finally {
    loading.value = false
  }
}
</script>
