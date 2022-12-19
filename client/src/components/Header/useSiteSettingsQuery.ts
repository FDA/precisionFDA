import { useQuery } from '@tanstack/react-query'
import { CDMHKey, siteSettingsRequest } from '../../features/auth/api'

export const CDMHNames = {
  cdmhPortal: 'CDMH Portal',
  cdrAdmin: 'CDR Admin',
  cdrBrowser: 'CDR Browser',
  connectPortal: 'Connect Portal',
} as Record<CDMHKey, string>

export const useSiteSettingsQuery = () => useQuery({
  queryKey: ['site-settings'],
  queryFn: siteSettingsRequest,
})
