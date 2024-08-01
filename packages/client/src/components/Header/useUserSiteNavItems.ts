import { useAuthUser } from '../../features/auth/useAuthUser'
import { useSiteSettingsQuery } from '../../features/auth/useSiteSettingsQuery'
import { cdmhNavItems, gsrsNavItems, siteNavItems } from './NavItems'

export const useUserSiteNavItems = () => {
  const user = useAuthUser()
  const siteSettings = useSiteSettingsQuery()

  const userIsGuest = user?.is_guest

  const showGSRSLink = !userIsGuest
  const showCDMHLink = !!siteSettings?.data?.cdmh.isEnabled && Object.keys(siteSettings?.data?.cdmh.data).length > 0

  let items = siteNavItems
  if(showGSRSLink) {
    items = [...items, ...gsrsNavItems]
  }
  if (showCDMHLink) {
    items = [...items, ...cdmhNavItems]
  }

  return { userSiteNavItems: items, showGSRSLink, showCDMHLink }
}
