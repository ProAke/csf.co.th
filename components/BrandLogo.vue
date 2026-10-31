<template>
  <div class="inline-flex items-center gap-3">
    <div
      style="background-color: #ffffff"
      :class="[
        'shrink-0 flex items-center justify-center bg-white',
        variant === 'dark' ? 'px-2 py-1.5 rounded-md shadow-sm' : 'p-0.5'
      ]"
    >
      <img
        v-if="!imgFailed"
        :src="configuredLogo"
        :alt="altText"
        style="background-color: #ffffff"
        :class="[sizeClass, 'w-auto object-contain select-none bg-white block']"
        loading="eager"
        decoding="async"
        @error="imgFailed = true"
      />
      <span
        v-else
        style="background-color: #ffffff"
        class="px-2.5 py-1 bg-white text-black border-2 border-black font-extrabold text-sm tracking-tight"
      >
        CSF
      </span>
    </div>

    <div v-if="showText" class="min-w-0">
      <div
        class="font-extrabold tracking-tight leading-tight truncate"
        :class="variant === 'dark' ? 'text-white text-base sm:text-lg' : 'text-slate-900 text-base sm:text-lg'"
      >
        CSF <span class="text-sky-600" :class="variant === 'dark' ? '!text-sky-400' : ''">Technology Touch</span>
      </div>
      <p
        class="text-[11px] font-medium leading-tight truncate"
        :class="variant === 'dark' ? 'text-slate-400' : 'text-slate-500'"
      >
        {{ companySubtitle }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'light' | 'dark'
    size?: 'sm' | 'md' | 'lg'
    showText?: boolean
    subtitle?: string
  }>(),
  {
    variant: 'light',
    size: 'md',
    showText: true,
    subtitle: ''
  }
)

const { siteState } = useSiteData()

const configuredLogo = computed(() => {
  return siteState.value?.settings?.site_logo || '/uploads/brand/csf_logo.png'
})

const imgFailed = ref(false)
watch(configuredLogo, () => {
  imgFailed.value = false
})

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'h-9 sm:h-10'
  if (props.size === 'lg') return 'h-12 sm:h-14'
  return 'h-11 sm:h-12'
})

const altText = computed(() => {
  return siteState.value?.settings?.company_name_th || 'บริษัท ซีเอสเอฟ จำกัด (CSF CO.,LTD.)'
})

const companySubtitle = computed(() => {
  if (props.subtitle) return props.subtitle
  const nameTh = siteState.value?.settings?.company_name_th || 'บริษัท ซีเอสเอฟ จำกัด'
  return `${nameTh} • IT, Network, AV & CCTV`
})
</script>
