export interface PrefillQuoteProduct {
  id?: number
  sku: string
  name: string
}

export function useSiteData() {
  const siteState = useState<any>('csf-site-data', () => null)
  const quoteModalOpen = useState<boolean>('csf-quote-modal-open', () => false)
  const quoteModalProduct = useState<PrefillQuoteProduct | null>('csf-quote-modal-product', () => null)
  const lineQrModalOpen = useState<boolean>('csf-line-qr-modal-open', () => false)

  async function fetchSite(force = false) {
    if (siteState.value && !force) return siteState.value
    const data = await $fetch('/api/site')
    siteState.value = data
    return data
  }

  function openQuoteModal(product?: PrefillQuoteProduct | null) {
    quoteModalProduct.value = product || null
    quoteModalOpen.value = true
  }

  function closeQuoteModal() {
    quoteModalOpen.value = false
  }

  function openLineModal() {
    lineQrModalOpen.value = true
  }

  function closeLineModal() {
    lineQrModalOpen.value = false
  }

  const lineUrl = computed(() => {
    const raw = siteState.value?.social?.line_oa?.handle_or_url || '@csf.co.th'
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
    const clean = raw.startsWith('@') ? raw : `@${raw}`
    return `https://line.me/R/ti/p/${encodeURIComponent(clean)}`
  })

  const facebookUrl = computed(() => {
    const raw = siteState.value?.social?.facebook?.handle_or_url || 'https://www.facebook.com/csf.co.th'
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
    return `https://www.facebook.com/${raw.replace(/^@/, '')}`
  })

  return {
    siteState,
    fetchSite,
    quoteModalOpen,
    quoteModalProduct,
    openQuoteModal,
    closeQuoteModal,
    lineQrModalOpen,
    openLineModal,
    closeLineModal,
    lineUrl,
    facebookUrl
  }
}
