import type { ReactNode, RefObject } from 'react'
import { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { type PlacesType, Tooltip } from 'react-tooltip'
import { useAlertDismissed } from '@/features/admin/alerts/useAlertDismissedLocalStorage'
import { type CDMHKey, logout } from '@/features/auth/api'
import { useAuthUser } from '@/features/auth/useAuthUser'
import { CDMHNames, type SiteSettingsDataPortal, useSiteSettingsQuery } from '@/features/auth/useSiteSettingsQuery'
import { useOnOutsideClickRef } from '@/hooks/useOnOutsideClick'
import type { IUser } from '@/types/user'
import { cn } from '@/utils/cn'
import { AlertBanner } from '../AlertBanner'
import { TransparentButton } from '../Button'
import { useSearchModal } from '../GlobalSearch/useSearchModal'
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon'
import { CaretIcon } from '../icons/CaretIcon'
import { CDMHIcon } from '../icons/CDMHIcon'
import { CrossIcon } from '../icons/PlusIcon'
import { ProfileIcon } from '../icons/ProfileIcon'
import { SearchIcon } from '../icons/SearchIcon'
import { SiteMenuIcon } from '../icons/SiteMenuIcon'
import { StarIcon } from '../icons/StarIcon'
import Menu from '../Menu/Menu'
import { PFDALogoLight } from '../NavigationBar/PFDALogo'
import { NotificationCenter } from '../NotificationCenter/NotificationCenter'
import { ThemeToggle } from '../ThemeToggle'
import { useEditFavoritesModal } from './favorites/useEditFavoritesModal'
import { headerDropdownTrigger, headerIconWrap } from './header.classes'
import styles from './header.module.css'
import { getNavigationPath, getNavigationRel, getNavigationTarget, type SiteNavItemType } from './NavItems'
import { UserMenu } from './UserMenu'
import type { NavFavorite } from './useNavFavorites'
import { useUserSiteNavItems } from './useUserSiteNavItems'

/** Shared hit target + hover fill for header chrome */
const headerChromeInteractive = (active?: boolean) =>
  cn(
    'flex shrink-0 items-center gap-2 rounded-[3px] !px-2 !py-1.5 text-[13px] leading-none',
    'transition-[background-color,color] duration-100 ease-in-out',
    'hover:!bg-app-header-hover hover:!text-white',
    active && 'bg-app-header-hover !text-white',
  )

/**
 * Favorites strip + search control.
 * `!text-*` beats global `a { color: var(--c-link) }` (app-globals.css) now that links use this on `<a>`.
 */
const headerBarItem = (active?: boolean) =>
  cn(headerChromeInteractive(active), !active && '!text-app-header-favorite-inactive')

/** Hamburger + star; explicit menu color so triggers / globals never leak link blue */
const headerMenuButton = (active?: boolean) =>
  cn(
    '!p-2 !text-app-header-menu transition-[background-color,color] duration-100 ease-in-out',
    'hover:!bg-app-header-hover hover:!text-app-header-menu',
    active && 'bg-app-header-hover !text-white',
  )

/** Sidebar row (inside site nav drawer) */
const siteNavMenuRow = (active?: boolean) =>
  cn(
    'flex min-h-6 items-center gap-2 rounded-[3px] py-1 pl-2.5 pr-1 text-legacy-base',
    '[&_svg]:shrink-0',
    'hover:bg-tertiary-muted',
    active && 'bg-app-header-menu-surface',
  )

const siteNavMenuRowNoHover = () => cn(siteNavMenuRow(false), 'hover:!bg-transparent')

/** CDMH sub-links */
const siteNavSubLink = () =>
  cn(
    siteNavMenuRow(false),
    'ml-3 min-h-[14px] cursor-pointer justify-between text-sm font-bold',
    '[&_svg]:mr-1 [&_svg]:rotate-180 [&_svg]:opacity-30',
  )

/** Disabled nav row (sidebar + top bar); drawer hover uses header.module.css */
const siteNavDisabledRow = ({ inDrawer = true }: { inDrawer?: boolean } = {}) =>
  cn(
    'flex min-h-6 cursor-not-allowed items-center gap-2 rounded-[3px] py-1 pl-2.5 pr-1',
    '[&_svg]:shrink-0',
    'hover:bg-transparent',
    '[&_div_a]:text-legacy-link',
    styles.siteNavDisabledRow,
    inDrawer ? 'text-menu-item-disabled-drawer' : 'text-menu-item-disabled dark:text-menu-item-disabled-dark',
  )

export function getObjectsByIds(ids: string[], items: SiteNavItemType[]) {
  const itemMap = Object.fromEntries(items.map(item => [item.id, item]))
  return ids.map(id => itemMap[id]).filter(Boolean) as SiteNavItemType[]
}

const isActiveLink = (linkPath: string, pathname: string) => {
  if (linkPath === '/') {
    // Special case
    return pathname === linkPath
  }
  return pathname.startsWith(linkPath)
}

const MenuLink = ({
  navItem,
  onClick,
  children,
  className,
  ...rest
}: {
  navItem: SiteNavItemType
  onClick?: () => void
  children: ReactNode
  className?: string
  'data-testid': string
}) => {
  if (navItem.navigation.type === 'internal') {
    return (
      <Link
        to={getNavigationPath(navItem)}
        onClick={onClick}
        title={navItem.text}
        data-testid={rest['data-testid']}
        className={className}
      >
        {children}
      </Link>
    )
  }

  return (
    <a
      href={getNavigationPath(navItem)}
      rel={getNavigationRel(navItem)}
      target={getNavigationTarget(navItem)}
      onClick={onClick}
      title={navItem.text}
      data-testid={rest['data-testid']}
      className={className}
    >
      {children}
    </a>
  )
}

const MenuItem = ({
  navItem,
  pathname,
  onClick,
}: {
  navItem: SiteNavItemType
  pathname: string
  onClick: () => void
}) => {
  const active = isActiveLink(getNavigationPath(navItem), pathname)
  return (
    <MenuLink navItem={navItem} onClick={onClick} data-testid={`sitenav-${navItem.id}`}>
      <div className={siteNavMenuRow(active)}>
        <div className={headerIconWrap()}>
          <navItem.icon height={navItem.iconHeight} />
        </div>
        <div className="text-[13px]">{navItem.text}</div>
      </div>
    </MenuLink>
  )
}

const DisabledMenuItem = ({
  navItem,
  siteSettingsDataPortal,
  tooltipPos,
  inDrawer = true,
}: {
  navItem: SiteNavItemType
  siteSettingsDataPortal: SiteSettingsDataPortal
  tooltipPos?: PlacesType
  /** Site nav drawer uses lighter disabled text than the top bar */
  inDrawer?: boolean
}) => {
  const tooltipPosition: PlacesType = tooltipPos || 'right'
  return (
    <div className={siteNavDisabledRow({ inDrawer })} data-tooltip-id={`menu-item.${navItem.id}.${tooltipPosition}`}>
      <Tooltip id={`menu-item.${navItem.id}.${tooltipPosition}`} clickable place={tooltipPosition}>
        <div>{siteSettingsDataPortal?.tooltipText}</div>
        <div>
          <a className="underline" href={`mailto:${siteSettingsDataPortal?.mailto}`}>
            Reach out to the FDA for access.
          </a>
        </div>
      </Tooltip>
      <div className={headerIconWrap()}>
        <navItem.icon height={navItem.iconHeight} />
      </div>
      <div className="text-[13px]">{navItem.text}</div>
    </div>
  )
}

const DisabledTopMenuItem = ({
  navItem,
  siteSettingsDataPortal,
}: {
  navItem: SiteNavItemType
  siteSettingsDataPortal: SiteSettingsDataPortal
}) => {
  return (
    <DisabledMenuItem
      navItem={navItem}
      siteSettingsDataPortal={siteSettingsDataPortal}
      tooltipPos="bottom"
      inDrawer={false}
    />
  )
}

const dataPortalMenuItem = (
  i: SiteNavItemType,
  pathname: string,
  setShowSiteNav: (v: boolean, ms?: number) => void,
  siteSettingsDataPortal: SiteSettingsDataPortal | undefined,
) => {
  if (siteSettingsDataPortal?.accessible) {
    return <MenuItem key={i.id} navItem={i} pathname={pathname} onClick={() => setShowSiteNav(false)} />
  }
  if (siteSettingsDataPortal) {
    return <DisabledMenuItem key={i.id} navItem={i} siteSettingsDataPortal={siteSettingsDataPortal} />
  }
  return <MenuItem key={i.id} navItem={i} pathname={pathname} onClick={() => setShowSiteNav(false)} />
}

const getUsername = (user?: IUser) => {
  if (user) {
    if (user.full_name === ' ') {
      return user.dxuser
    }
    return user.full_name
  }
  return '...'
}

const SiteNav = ({
  open,
  setShowSiteNav,
  ignoredOutsideClickRef,
  isSiteAdmin = false,
}: {
  open: boolean
  setShowSiteNav: (v: boolean, ms?: number) => void
  ignoredOutsideClickRef: RefObject<HTMLElement> | RefObject<HTMLButtonElement | null>
  isSiteAdmin: boolean
}) => {
  const clickRef = useOnOutsideClickRef(true, () => setShowSiteNav(false), ignoredOutsideClickRef)
  const { pathname } = useLocation()
  const { data: siteSettings } = useSiteSettingsQuery()
  const { userSiteNavItems, showCDMHLink, showGSRSLink } = useUserSiteNavItems()

  const portalIDs = ['daaas', 'prism', 'tools']
  if (isSiteAdmin) {
    portalIDs.push('precisionfda-system-administration-portal')
  }

  return (
    <div
      ref={clickRef}
      data-site-nav-drawer
      className={cn(
        'absolute bottom-0 left-0 z-3 flex w-[400px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
        'top-below-header',
        'shadow-none transition-all duration-80 ease-out motion-reduce:duration-150',
        open ? 'translate-x-0 shadow-[0_0_40px_rgb(0_0_0/0.22)]' : '-translate-x-full pointer-events-none',
      )}
    >
      <div className="absolute right-4 top-2 flex justify-end">
        <TransparentButton className="p-2" onClick={() => setShowSiteNav(false, 100)}>
          <CrossIcon height={16} />
        </TransparentButton>
      </div>
      <div className={cn('min-h-0 flex-1 overflow-y-auto px-4', styles.siteNavBodyScroll)}>
        <div className="flex gap-8 py-8 [&>div]:min-w-[148px]">
          <div>
            {getObjectsByIds(
              ['overview', 'data-portals', 'discussions', 'challenges', 'experts'],
              userSiteNavItems,
            ).map(i => (
              <MenuItem key={i.id} navItem={i} pathname={pathname} onClick={() => setShowSiteNav(false)} />
            ))}
            <div className="mx-1 h-5 opacity-60" />
            {getObjectsByIds(['home', 'spaces'], userSiteNavItems).map(i => (
              <MenuItem key={i.id} navItem={i} pathname={pathname} onClick={() => setShowSiteNav(false)} />
            ))}
            <div className="mx-1 h-5 opacity-60" />
            {getObjectsByIds(['notes', 'comparisons'], userSiteNavItems).map(i => (
              <MenuItem key={i.id} navItem={i} pathname={pathname} onClick={() => setShowSiteNav(false)} />
            ))}
            <div className="mx-1 h-5 opacity-60" />
            {getObjectsByIds(['docs', 'support'], userSiteNavItems).map(i => (
              <MenuItem key={i.id} navItem={i} pathname={pathname} onClick={() => setShowSiteNav(false)} />
            ))}
          </div>
          <div>
            {getObjectsByIds(portalIDs, userSiteNavItems).map(i =>
              dataPortalMenuItem(i, pathname, setShowSiteNav, siteSettings?.dataPortals[i.id]),
            )}
            <div className="mx-1 h-5 opacity-60" />

            {showGSRSLink &&
              getObjectsByIds(['gsrs'], userSiteNavItems).map(i => (
                <MenuItem key={i.id} navItem={i} pathname={pathname} onClick={() => setShowSiteNav(false)} />
              ))}
            <div className="mx-1 h-5 opacity-60" />
            {showCDMHLink && (
              <>
                <Tooltip id="menu-item.cdmh.right" clickable place="right">
                  <div>This is the Common Data Model Harmonization; access is currently restricted to FDA users.</div>
                  <div>
                    <a
                      className="underline"
                      href="mailto:mitra.rocca@fda.hhs.gov?cc=precisionFDA@fda.hhs.gov&subject=CDMH access request"
                    >
                      Reach out to the FDA for access.
                    </a>
                  </div>
                </Tooltip>
                <div className={siteNavMenuRowNoHover()} data-tooltip-id="menu-item.cdmh.right">
                  <div className={headerIconWrap()}>
                    <CDMHIcon height={20} />
                  </div>
                  <div className="text-[13px]">CDMH</div>
                </div>
                {Object.entries(siteSettings?.cdmh?.data ?? {}).map(([key, url]) => (
                  <a key={key} className={siteNavSubLink()} target="_blank" rel="noreferrer" href={url}>
                    {CDMHNames[key as CDMHKey]}&nbsp;
                    <ArrowLeftIcon />
                  </a>
                ))}
                <div className="mx-1 h-5 opacity-60" />
              </>
            )}
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 right-4 flex justify-between">
        <div />
        <ThemeToggle />
      </div>
    </div>
  )
}

const Header = () => {
  const [showSiteNav, setShowSiteNav] = useState(false)
  const { pathname } = useLocation()
  const user = useAuthUser()
  const siteSettings = useSiteSettingsQuery()
  const { isAlertDismissed, setIsAlertDismissed } = useAlertDismissed()
  const buttonElement = useRef<HTMLButtonElement>(null)
  const { isShown, modalComp, setShowModal } = useEditFavoritesModal()
  const { isShown: isSearchShown, modalComp: searchModalComp, setShowModal: setShowSearch } = useSearchModal()
  const { userSiteNavItems } = useUserSiteNavItems()

  if (!user) return null

  const userCanAdministerSite = user.can_administer_site || false
  const showAlertBanner = !isAlertDismissed && !!siteSettings.data?.alerts?.[0]

  const handleLogout = async () => {
    setIsAlertDismissed(false)
    await logout().then(() => {
      window.location.replace('/')
    })
  }

  const setSidebar = (v: boolean, ms?: number) => {
    setTimeout(() => {
      setShowSiteNav(() => v)
    }, ms ?? 225)
  }

  const getOrderedFavoritesOnly = (items: NavFavorite[]) => {
    return items.filter(item => item.favorite).map(item => item.name)
  }

  const orderedFavorites = getOrderedFavoritesOnly(user.header_items ?? [])

  return (
    <>
      {modalComp}
      {searchModalComp}
      {showAlertBanner && siteSettings.data?.alerts?.[0] && (
        <AlertBanner
          variant={siteSettings.data.alerts[0].type}
          dismissAlert={() => setIsAlertDismissed(true)}
          alertText={siteSettings.data.alerts[0].content}
        />
      )}
      <SiteNav
        open={showSiteNav}
        ignoredOutsideClickRef={buttonElement}
        setShowSiteNav={setSidebar}
        isSiteAdmin={userCanAdministerSite}
      />
      <header
        className={cn(
          'flex min-h-site-header border-b border-app-header-border bg-app-header px-8 text-app-header-menu',
          'z-3 box-border',
        )}
        data-testid="main-header"
      >
        <nav className="flex w-full flex-1 flex-nowrap items-center gap-4 text-xs font-normal whitespace-nowrap transition-all duration-180 ease-in-out [&_a]:text-inherit [&_a]:no-underline [&_button]:shrink-0">
          <Link to="/" data-turbolinks="false" className="shrink-0">
            <PFDALogoLight className="box-border min-w-[143.98px] py-1" height={20} />
          </Link>
          <TransparentButton
            className={headerMenuButton(showSiteNav)}
            data-testid="button-open-menu"
            ref={buttonElement}
            onClick={() => setSidebar(!showSiteNav, 100)}
          >
            <SiteMenuIcon height={20} />
          </TransparentButton>
          <div className="hidden min-h-0 min-[850px]:flex min-[850px]:min-w-0 min-[850px]:flex-1 min-[850px]:items-center min-[850px]:overflow-hidden">
            <div
              className={cn(
                styles.headerFavoritesScroll,
                'flex min-h-0 min-w-0 flex-1 flex-nowrap items-center gap-x-[9px] overflow-x-auto overflow-y-hidden overscroll-x-contain *:shrink-0 [&_a]:flex [&_a]:max-w-max',
              )}
            >
              {getObjectsByIds(orderedFavorites, userSiteNavItems).map(i => {
                if (siteSettings?.data?.dataPortals[i.id]?.accessible === false) {
                  return (
                    <DisabledTopMenuItem
                      key={i.id}
                      navItem={i}
                      siteSettingsDataPortal={siteSettings.data.dataPortals[i.id]}
                    />
                  )
                }

                const dynamicNavItem = { ...i }

                // If CDMH item, get the correct link
                const normalizedId = i.id.replace(/-([a-z])/g, (_match, letter) => {
                  return letter.toUpperCase()
                }) as CDMHKey
                const cdmhList = siteSettings.data?.cdmh.data
                if (cdmhList !== undefined && cdmhList[normalizedId] !== undefined) {
                  dynamicNavItem.navigation = { type: 'external', url: cdmhList[normalizedId] }
                }
                if (i.id === 'spaces' && !!user?.can_administer_site) {
                  dynamicNavItem.navigation = { type: 'internal', path: '/spaces?hidden=false' }
                }

                const { id, iconHeight, text, icon: Icon } = dynamicNavItem
                const navigationPath = getNavigationPath(dynamicNavItem)
                const favActive = isActiveLink(navigationPath, pathname)

                return (
                  <MenuLink
                    navItem={dynamicNavItem}
                    key={id}
                    data-testid={`favoritenav-${id}`}
                    className={headerBarItem(favActive)}
                  >
                    <div className={headerIconWrap(true)}>
                      <Icon height={iconHeight} />
                    </div>
                    <div className="text-[13px]">{text}</div>
                  </MenuLink>
                )
              })}
              <div
                className={cn(
                  'sticky right-0 z-10 flex shrink-0 items-center border-app-header-border border-0 bg-app-header py-1 pl-2',
                  'shadow-[-8px_0_12px_-4px_var(--c-app-header-bg)]',
                )}
              >
                <TransparentButton
                  className={headerMenuButton(false)}
                  data-testid="button-edit-menu-favorites"
                  onClick={() => setShowModal(!isShown)}
                  title="Edit Favorites"
                >
                  <StarIcon height={14} />
                </TransparentButton>
              </div>
            </div>
          </div>
          <div className="ml-auto flex min-w-fit items-center gap-3">
            <TransparentButton
              type="button"
              className={headerBarItem(isSearchShown)}
              onClick={() => setShowSearch(true)}
              data-testid="search-button"
            >
              <SearchIcon />
            </TransparentButton>

            <NotificationCenter />
            <Menu
              positioner={{ sideOffset: 3, side: 'bottom', align: 'end' }}
              trigger={
                <Menu.Trigger>
                  <div className={headerDropdownTrigger(false)} data-testid="user-context-menu">
                    <div className={headerIconWrap()}>
                      <ProfileIcon height={16} />
                    </div>
                    <div className="flex select-none items-center text-[13px]">
                      {getUsername(user)}
                      <span className="mb-px ml-[5px] inline-flex">
                        <CaretIcon height={6} />
                      </span>
                    </div>
                  </div>
                </Menu.Trigger>
              }
            >
              <UserMenu user={user} userCanAdministerSite={userCanAdministerSite} handleLogout={handleLogout} />
            </Menu>
          </div>
        </nav>
      </header>
    </>
  )
}

export default Header
