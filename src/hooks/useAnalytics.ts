type Provider = 'plausible' | 'umami' | undefined

const provider = (import.meta.env.VITE_ANALYTICS_PROVIDER as Provider) || undefined
const id = (import.meta.env.VITE_ANALYTICS_ID as string) || undefined

export function shouldCollect() {
  try {
    if (typeof navigator !== 'undefined' && (navigator as any).doNotTrack === '1') return false
  } catch (e) {}
  if (typeof window === 'undefined') return false
  if (!provider || !id) return false
  if (localStorage.getItem('analyticsOptOut') === '1') return false
  return true
}

export function initAnalytics() {
  if (!shouldCollect()) return

  if (provider === 'plausible' && id) {
    const s = document.createElement('script')
    s.setAttribute('defer', 'true')
    s.setAttribute('data-domain', String(id))
    s.src = `https://plausible.io/js/plausible.js`
    document.head.appendChild(s)
  }

  if (provider === 'umami' && id) {
    const s = document.createElement('script')
    s.setAttribute('defer', 'true')
    s.setAttribute('data-website-id', String(id))
    s.src = `https://umami.example.com/umami.js`
    document.head.appendChild(s)
  }
}

export function trackEvent(name: string, props?: Record<string, any>) {
  if (!shouldCollect()) return
  try {
    if ((window as any).plausible) {
      ;(window as any).plausible(name, { props: props || {} })
    } else if ((window as any).umami) {
      ;(window as any).umami.trackEvent?.(name, props)
    }
  } catch (e) {
    // swallow
  }
}

export function trackPageview(path?: string) {
  if (!shouldCollect()) return
  try {
    if ((window as any).plausible) {
      ;(window as any).plausible('pageview')
    } else if ((window as any).umami) {
      ;(window as any).umami.trackView?.(path || location.pathname)
    }
  } catch (e) {}
}

export default function useAnalytics() {
  // no-op hook, helpers exported
}
