export function useTracking() {
  function trackLeadConversion(params: {
    refCode: string
    source: string
    sku?: string
    hasAttachments?: boolean
  }) {
    if (!import.meta.client) return
    const w = window as any

    // Google Analytics 4 (gtag)
    if (typeof w.gtag === 'function') {
      w.gtag('event', 'generate_lead', {
        transaction_id: params.refCode,
        lead_source: params.source,
        item_id: params.sku || undefined,
        has_attachments: Boolean(params.hasAttachments)
      })
    }

    // Google Tag Manager (dataLayer)
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({
        event: 'csf_generate_lead',
        ref_code: params.refCode,
        lead_source: params.source,
        product_sku: params.sku || ''
      })
    }

    // Facebook / Meta Pixel (fbq)
    if (typeof w.fbq === 'function') {
      w.fbq('track', 'Lead', {
        content_name: params.sku || params.source,
        status: params.refCode
      })
    }
  }

  return {
    trackLeadConversion
  }
}
