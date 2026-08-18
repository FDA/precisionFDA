import { headers } from 'next/headers'

const FALLBACK_BASE_URL = 'https://precision.fda.gov'

export const getBaseUrlFromHeaders = async () => {
  const headersList = await headers()
  const host = headersList.get('host')
  if (!host) return FALLBACK_BASE_URL

  const protocol = headersList.get('x-forwarded-proto') || 'http'

  return `${protocol}://${host}`
}
