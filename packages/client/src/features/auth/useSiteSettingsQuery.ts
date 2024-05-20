import { useQuery } from '@tanstack/react-query'
import { CDMHKey, siteSettingsRequest } from './api'
import { Alert } from '../admin/alerts/alerts.types'

export const CDMHNames: Record<CDMHKey, string> = {
  cdmhPortal: 'CDMH Portal',
  cdrAdmin: 'CDR Admin',
  cdrBrowser: 'CDR Browser',
  connectPortal: 'Connect Portal',
}

export interface SiteSettingsResponse {
  cdmh: {
      isEnabled: boolean,
      data?: Record<CDMHKey, string> },
  ssoButton: {
      isEnabled: boolean
      data?: {
          fdaSsoUrl: string
      },
  },
  alerts: Alert[]
}

export const onLogInWithSSO = (fdaSsoUrl: string) => {
  window.location.assign(fdaSsoUrl)
}

export const useSiteSettingsQuery = () => useQuery({
  queryKey: ['site-settings'],
  queryFn: siteSettingsRequest,
})
