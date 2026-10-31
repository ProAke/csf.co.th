<template>
  <div class="space-y-6">
    <!-- DB & Integration Status Banner -->
    <div
      v-if="dash"
      class="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
    >
      <div class="flex items-start gap-3.5">
        <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
          <Database class="w-5 h-5" />
        </div>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm font-bold text-slate-900">สถานะฐานข้อมูลระบบ:</span>
            <span
              class="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              :class="
                dash.dbStatus.engine === 'mariadb'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-sky-100 text-sky-800'
              "
            >
              {{ dash.dbStatus.engine === 'mariadb' ? 'MariaDB Connected' : 'MariaDB-Compatible SQL Store' }}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">{{ dash.dbStatus.connectionNote }}</p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 shrink-0">
        <NuxtLink
          to="/office/integrations"
          class="px-3.5 py-2 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold transition"
        >
          ตั้งค่า LINE OA &amp; Facebook
        </NuxtLink>
        <NuxtLink
          to="/office/database"
          class="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
        >
          ส่งออกไฟล์ .SQL (MariaDB)
        </NuxtLink>
      </div>
    </div>

    <!-- KPI Cards -->
    <div v-if="dash" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <NuxtLink to="/office/products" class="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 shadow-sm transition space-y-2">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-semibold text-slate-500">รายการสินค้าทั้งหมด</span>
          <Package class="w-4 h-4 text-sky-600" />
        </div>
        <div class="text-2xl font-extrabold text-slate-900">{{ dash.stats.products }}</div>
        <div class="text-[11px] text-sky-700 font-semibold">ใน {{ dash.stats.categories }} หมวดหมู่หลัก →</div>
      </NuxtLink>

      <NuxtLink to="/office/inquiries" class="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 shadow-sm transition space-y-2">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-semibold text-slate-500">ใบขอราคา / ติดต่อลูกค้า</span>
          <Inbox class="w-4 h-4 text-amber-500" />
        </div>
        <div class="text-2xl font-extrabold text-slate-900">{{ dash.stats.inquiries }}</div>
        <div class="text-[11px] text-amber-600 font-semibold">รายการใหม่รอดำเนินการ {{ dash.stats.newInquiries }} รายการ →</div>
      </NuxtLink>

      <NuxtLink to="/office/articles" class="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 shadow-sm transition space-y-2">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-semibold text-slate-500">บทความ &amp; ซัพพอร์ต</span>
          <BookOpen class="w-4 h-4 text-indigo-600" />
        </div>
        <div class="text-2xl font-extrabold text-slate-900">{{ dash.stats.articles }}</div>
        <div class="text-[11px] text-indigo-600 font-semibold">จัดการเนื้อหาความรู้ →</div>
      </NuxtLink>

      <NuxtLink to="/office/integrations" class="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 shadow-sm transition space-y-2">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-xs font-semibold text-slate-500">กิจกรรม LINE &amp; Facebook</span>
          <Share2 class="w-4 h-4 text-[#06C755]" />
        </div>
        <div class="text-2xl font-extrabold text-slate-900">{{ dash.stats.socialLogs }}</div>
        <div class="text-[11px] text-emerald-700 font-semibold">ดู Webhook &amp; Broadcast →</div>
      </NuxtLink>
    </div>

    <!-- Two Columns: Recent Inquiries + Recent Social Logs -->
    <div v-if="dash" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Recent Inquiries -->
      <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="font-bold text-sm text-slate-900">รายการขอใบเสนอราคา / ติดต่อล่าสุด</h2>
          <NuxtLink to="/office/inquiries" class="text-xs font-bold text-sky-700 hover:underline">ดูทั้งหมด →</NuxtLink>
        </div>

        <div class="divide-y divide-slate-100">
          <div v-for="inq in dash.recentInquiries" :key="inq.id" class="p-4 hover:bg-slate-50 transition space-y-1">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs font-bold text-sky-700">{{ inq.ref_code }}</span>
                <span class="text-xs font-bold text-slate-900">{{ inq.customer_name }}</span>
                <span v-if="inq.company_name" class="text-xs text-slate-500">({{ inq.company_name }})</span>
              </div>
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                :class="
                  inq.status === 'new'
                    ? 'bg-amber-100 text-amber-800'
                    : inq.status === 'quoted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-sky-100 text-sky-800'
                "
              >
                {{ inq.status }}
              </span>
            </div>
            <p class="text-xs text-slate-700 font-medium">{{ inq.subject }}</p>
            <div class="text-[11px] text-slate-400 flex items-center gap-3">
              <span>ช่องทาง: {{ inq.source_channel }}</span>
              <span v-if="inq.phone">โทร: {{ inq.phone }}</span>
              <span v-if="inq.product_sku" class="font-mono text-slate-600">SKU: {{ inq.product_sku }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Social Logs -->
      <div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="font-bold text-sm text-slate-900">LINE OA &amp; Facebook Activity</h2>
          <NuxtLink to="/office/integrations" class="text-xs font-bold text-sky-700 hover:underline">ตั้งค่า / ทดสอบ →</NuxtLink>
        </div>

        <div class="divide-y divide-slate-100">
          <div v-for="log in dash.recentSocialLogs" :key="log.id" class="p-4 space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span
                class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                :class="log.platform === 'line_oa' ? 'bg-[#06C755]/15 text-emerald-700' : 'bg-[#1877F2]/15 text-blue-700'"
              >
                {{ log.platform === 'line_oa' ? 'LINE OA' : 'FACEBOOK' }} • {{ log.direction }}
              </span>
              <span class="text-[11px] font-mono text-slate-400">{{ log.status }}</span>
            </div>
            <p class="text-xs text-slate-700 leading-relaxed">{{ log.summary }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, Database, Inbox, Package, Share2 } from 'lucide-vue-next'

definePageMeta({ layout: 'office' })
useHead({ title: 'แดชบอร์ดหลังบ้าน (Admin Dashboard)' })

const { adminFetch } = useAdminAuth()
const dash = ref<any>(null)

onMounted(async () => {
  dash.value = await adminFetch('/api/office/dashboard')
})
</script>
