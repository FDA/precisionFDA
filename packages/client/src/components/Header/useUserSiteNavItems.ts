import { useSiteSettingsQuery } from '../../features/auth/useSiteSettingsQuery'
import { cdmhNavItems, gsrsNavItems, siteNavItems } from './NavItems'

export const useUserSiteNavItems = () => {
  const { data, isLoading, error } = useSiteSettingsQuery()

  if (isLoading || error || !data) {
    return {
      userSiteNavItems: siteNavItems,
      showGSRSLink: true,
      showCDMHLink: false,
    }
  }

  const showGSRSLink = true
  const showCDMHLink = data.cdmh?.isEnabled && data.cdmh?.data && Object.keys(data.cdmh.data).length > 0

  const items = showCDMHLink ? [...siteNavItems, ...gsrsNavItems, ...cdmhNavItems] : [...siteNavItems, ...gsrsNavItems]

  return {
    userSiteNavItems: items,
    showGSRSLink,
    showCDMHLink,
  }
}
