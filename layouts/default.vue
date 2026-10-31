<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900">
    <SiteTrackingScripts />
    <SiteHeader />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
    <SocialFloatingDock />
  </div>
</template>

<script setup lang="ts">
const { fetchSite } = useSiteData()

await useAsyncData('csf-site-global', () => fetchSite())
</script>
