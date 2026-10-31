<template>
  <div v-if="customBodyStartNonScript" v-html="customBodyStartNonScript" style="display: contents"></div>
  <div v-if="customBodyEndNonScript" v-html="customBodyEndNonScript" style="display: contents"></div>
</template>

<script setup lang="ts">
const route = useRoute()
const { siteState } = useSiteData()

const settings = computed(() => siteState.value?.settings || {})

const ga4Id = computed(() => String(settings.value.ga4_measurement_id || '').trim())
const gtmId = computed(() => String(settings.value.gtm_container_id || '').trim())
const fbPixelId = computed(() =>
  String(settings.value.facebook_pixel_id || siteState.value?.social?.facebook?.pixel_id || '').trim()
)

const rawHeadCode = computed(() => String(settings.value.custom_head_scripts || '').trim())
const rawBodyStartCode = computed(() => String(settings.value.custom_body_start_scripts || '').trim())
const rawBodyEndCode = computed(() => String(settings.value.custom_body_end_scripts || '').trim())

const META_RE = new RegExp('<meta\\s+([^>]+?)\\/?>', 'gi')
const ATTR_RE = new RegExp('([a-zA-Z0-9_:-]+)(?:\\s*=\\s*["\']([^"\']*)["\'])?', 'g')
const SCRIPT_RE = new RegExp('<scr' + 'ipt\\b([^>]*)>([\\s\\S]*?)<\\/scr' + 'ipt>', 'gi')

function parseCustomTags(raw: string) {
  const metas: Array<Record<string, string>> = []
  const scripts: Array<Record<string, any>> = []
  if (!raw) return { metas, scripts, htmlWithoutScripts: '' }

  for (const m of raw.matchAll(META_RE)) {
    const attrs: Record<string, string> = {}
    for (const attr of m[1].matchAll(ATTR_RE)) {
      if (attr[2] !== undefined) attrs[attr[1]] = attr[2]
    }
    if (Object.keys(attrs).length) metas.push(attrs)
  }

  for (const s of raw.matchAll(SCRIPT_RE)) {
    const attrStr = s[1] || ''
    const inner = (s[2] || '').trim()
    const entry: Record<string, any> = {}
    for (const attr of attrStr.matchAll(ATTR_RE)) {
      entry[attr[1]] = attr[2] !== undefined ? attr[2] : true
    }
    if (inner) entry.innerHTML = inner
    scripts.push(entry)
  }

  const htmlWithoutScripts = raw.replace(SCRIPT_RE, '').replace(META_RE, '').trim()
  return { metas, scripts, htmlWithoutScripts }
}

const parsedHead = computed(() => parseCustomTags(rawHeadCode.value))
const parsedBodyStart = computed(() => parseCustomTags(rawBodyStartCode.value))
const parsedBodyEnd = computed(() => parseCustomTags(rawBodyEndCode.value))

const customBodyStartNonScript = computed(() => parsedBodyStart.value.htmlWithoutScripts)
const customBodyEndNonScript = computed(() => parsedBodyEnd.value.htmlWithoutScripts)

useHead(() => {
  const headScripts: any[] = []
  const headMetas: any[] = [...parsedHead.value.metas]
  const noscripts: any[] = []

  // 1. Google Analytics 4 (gtag.js)
  if (ga4Id.value) {
    headScripts.push({
      key: 'csf-ga4-src',
      async: true,
      src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id.value)}`
    })
    headScripts.push({
      key: 'csf-ga4-init',
      innerHTML: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', ${JSON.stringify(ga4Id.value)});`
    })
  }

  // 2. Google Tag Manager (GTM)
  if (gtmId.value) {
    headScripts.push({
      key: 'csf-gtm-init',
      innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(gtmId.value)});`
    })
    noscripts.push({
      key: 'csf-gtm-noscript',
      tagPosition: 'bodyOpen',
      innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmId.value)}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
    })
  }

  // 3. Facebook / Meta Pixel Tag
  if (fbPixelId.value) {
    headMetas.push({ name: 'facebook-pixel-id', content: fbPixelId.value })
    headScripts.push({
      key: 'csf-fb-pixel-init',
      innerHTML: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', ${JSON.stringify(fbPixelId.value)}); fbq('track', 'PageView');`
    })
    noscripts.push({
      key: 'csf-fb-noscript',
      tagPosition: 'bodyOpen',
      innerHTML: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${encodeURIComponent(fbPixelId.value)}&ev=PageView&noscript=1" alt="" />`
    })
  }

  // 4. Custom Head / Body Start / Body End Scripts
  parsedHead.value.scripts.forEach((sc, idx) => {
    headScripts.push({ key: `csf-custom-head-${idx}`, ...sc })
  })
  parsedBodyStart.value.scripts.forEach((sc, idx) => {
    headScripts.push({ key: `csf-custom-bstart-${idx}`, tagPosition: 'bodyOpen', ...sc })
  })
  parsedBodyEnd.value.scripts.forEach((sc, idx) => {
    headScripts.push({ key: `csf-custom-bend-${idx}`, tagPosition: 'bodyClose', ...sc })
  })

  return {
    meta: headMetas,
    script: headScripts,
    noscript: noscripts
  }
})

// Track SPA route navigations after initial load
watch(
  () => route.fullPath,
  (newPath, oldPath) => {
    if (!import.meta.client || !oldPath || newPath === oldPath) return
    const w = window as any
    if (ga4Id.value && typeof w.gtag === 'function') {
      w.gtag('config', ga4Id.value, { page_path: newPath })
    }
    if (fbPixelId.value && typeof w.fbq === 'function') {
      w.fbq('track', 'PageView')
    }
  }
)
</script>
