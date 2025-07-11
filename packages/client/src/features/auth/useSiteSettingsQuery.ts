import { useQuery } from '@tanstack/react-query'
import { CDMHKey, siteSettingsRequest } from './api'
import { Alert } from '../admin/alerts/alerts.types'

export const CDMHNames: Record<CDMHKey, string> = {
  cdmhPortal: 'CDMH Portal',
  cdrAdmin: 'CDR Admin',
  cdrBrowser: 'CDR Browser',
  connectPortal: 'Connect Portal',
}

export interface SiteSettingsDataPortal {
  accessible: boolean,
  tooltipText: string,
  mailto: string
}

export interface SiteSettingsResponse {
  cdmh: {
      isEnabled: boolean,
      data?: Record<CDMHKey, string> },
  ssoButton: {
      isEnabled: boolean
      data?: {
          ssoUrl: string
      },
  },
  alerts: Alert[],
  dataPortals: { [key: string]: SiteSettingsDataPortal }
}

export const onLogInWithSSO = (ssoUrl?: string) => {
  if (!ssoUrl) {
    console.error('SSO URL is required for login')
    return
  }
  window.location.assign(ssoUrl)
}

export const useSiteSettingsQuery = () => useQuery({
  queryKey: ['site-settings'],
  queryFn: siteSettingsRequest,
})
