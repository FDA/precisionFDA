export const PAGE_META = {
  siteName: 'precisionFDA',
  defaultTitle: 'precisionFDA',
  defaultDescription:
    'A secure, collaborative, cloud-based high-performance computing environment advancing regulatory science and AI innovation for the FDA.',
  imageFile: 'og-image.png',
  type: 'website',
  locale: 'en_US',
  twitterCard: 'summary_large_image',
} as const

export type PageMetaInput = {
  title?: string
  description?: string
  imagePath?: string
  url?: string
}

const metaAttribute = (attribute: 'name' | 'property', key: string): string => `meta[${attribute}="${key}"]`

const setMetaContent = (attribute: 'name' | 'property', key: string, content: string): void => {
  if (typeof document === 'undefined') {
    return
  }

  let element = document.querySelector<HTMLMetaElement>(metaAttribute(attribute, key))
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

export const resolveAssetUrl = (path: string): string => {
  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return new URL(`${normalizedBase}${normalizedPath}`, window.location.origin).href
}

export const resolvePageMeta = ({
  title = PAGE_META.defaultTitle,
  description = PAGE_META.defaultDescription,
  imagePath = PAGE_META.imageFile,
  url,
}: PageMetaInput = {}) => {
  const pageUrl = url ?? (typeof window !== 'undefined' ? window.location.href : undefined)

  return {
    title,
    description,
    imageUrl: typeof window !== 'undefined' ? resolveAssetUrl(imagePath) : undefined,
    url: pageUrl,
  }
}

export const applyPageMeta = (input: PageMetaInput = {}): void => {
  if (typeof document === 'undefined') {
    return
  }

  const { title, description, imageUrl, url } = resolvePageMeta(input)

  document.title = title

  setMetaContent('name', 'description', description)
  setMetaContent('property', 'og:title', title)
  setMetaContent('property', 'og:description', description)
  setMetaContent('property', 'og:site_name', PAGE_META.siteName)
  setMetaContent('property', 'og:type', PAGE_META.type)
  setMetaContent('property', 'og:locale', PAGE_META.locale)
  setMetaContent('name', 'twitter:card', PAGE_META.twitterCard)
  setMetaContent('name', 'twitter:title', title)
  setMetaContent('name', 'twitter:description', description)

  if (imageUrl) {
    setMetaContent('property', 'og:image', imageUrl)
    setMetaContent('name', 'twitter:image', imageUrl)
  }

  if (url) {
    setMetaContent('property', 'og:url', url)
  }
}
