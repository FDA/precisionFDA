import { useSiteSettingsQuery } from '../../features/auth/useSiteSettingsQuery'
import { cdmhNavItems, gsrsNavItems, siteNavItems } from './NavItems'

export const useUserSiteNavItems = () => {
  const siteSettings = useSiteSettingsQuery()

  const showGSRSLink = true
  const showCDMHLink = !!siteSettings?.data?.cdmh.isEnabled && Object.keys(siteSettings?.data?.cdmh.data).length > 0
  let items = siteNavItems
  if (showGSRSLink) {
    items = [...items, ...gsrsNavItems]
  }
  if (showCDMHLink) {
    items = [...items, ...cdmhNavItems]
  }

  return { userSiteNavItems: items, showGSRSLink, showCDMHLink }
}
