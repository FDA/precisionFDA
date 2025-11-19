import classNames from 'classnames'
import React, { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PlacesType, Tooltip } from 'react-tooltip'
import { useAlertDismissed } from '../../features/admin/alerts/useAlertDismissedLocalStorage'
import { CDMHKey, logout } from '../../features/auth/api'
import { useAuthUser } from '../../features/auth/useAuthUser'
import { useGenerateKeyModal } from '../../features/auth/useGenerateKeyModal'
import { CDMHNames, SiteSettingsDataPortal, useSiteSettingsQuery } from '../../features/auth/useSiteSettingsQuery'
import { useOnOutsideClickRef } from '../../hooks/useOnOutsideClick'
import { IUser } from '../../types/user'
import { AlertBanner } from '../AlertBanner'
import { TransparentButton } from '../Button'
import { CloudResourceModal } from '../CloudResourcesModal'
import Menu from '../Menu/Menu'
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon'
import { CDMHIcon } from '../icons/CDMHIcon'
import { CaretIcon } from '../icons/CaretIcon'
import { CrossIcon } from '../icons/PlusIcon'
import { ProfileIcon } from '../icons/ProfileIcon'
import { SiteMenuIcon } from '../icons/SiteMenuIcon'
import { StarIcon } from '../icons/StarIcon'
import { ThemeToggle } from '../ThemeToggle'
import { getNavigationPath, getNavigationRel, getNavigationTarget, SiteNavItemType } from './NavItems'
import { getOrderedFavoritesOnly } from './getOrderedFavoritesOnly'
import { getObjectsByIds } from './orderObjectById'
import {
  DisabledSiteMenuItem,
  DropdownMenuItem,
  EditMenuWrap,
  HeaderItemText,
  HeaderLeft,
  HeaderMenuItem,
  HeaderRight,
  HeaderSpacer,
  IconWrap,
  LogoWrap,
  MenuButton,
  Nav,
  Row,
  SiteMenuItem,
  SiteMenuText,
  SiteNavBody,
  SiteNavBottom,
  SiteNavTop,
  StyledDivider,
  StyledDropMenuLinks,
  StyledHeader,
  StyledHeaderLogo,
  StyledLink,
  StyledOnClickModalDiv,
  StyledSiteNav,
  SubLink,
} from './styles'
import { useEditFavoritesModal } from './useEditFavoritesModal'
import { useNavFavorites } from './useNavFavorites'
import { useUserSiteNavItems } from './useUserSiteNavItems'
import { useSearchModal } from '../GlobalSearch/useSearchModal'
import { SearchIcon } from '../icons/SearchIcon'
import { UserMenu } from './UserMenu'

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
  ...rest
}: {
  navItem: SiteNavItemType
  onClick?: () => void
  children: React.ReactNode
  'data-testid': string
}) => {
  if (navItem.navigation.type === 'internal') {
    return (
      <Link to={getNavigationPath(navItem)} onClick={onClick} title={navItem.text} data-testid={rest['data-testid']}>
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
    >
      {children}
    </a>
  )
}

const MenuItem = ({ navItem, pathname, onClick }: { navItem: SiteNavItemType; pathname: string; onClick: () => void }) => {
  return (
    <MenuLink navItem={navItem} onClick={onClick} data-testid={`sitenav-${navItem.id}`}>
      <SiteMenuItem $active={isActiveLink(getNavigationPath(navItem), pathname)}>
        <IconWrap>
          <navItem.icon height={navItem.iconHeight} />
        </IconWrap>
        <SiteMenuText>{navItem.text}</SiteMenuText>
      </SiteMenuItem>
    </MenuLink>
  )
}

const DisabledMenuItem = ({
  navItem,
  siteSettingsDataPortal,
  tooltipPos,
}: {
  navItem: SiteNavItemType
  siteSettingsDataPortal: SiteSettingsDataPortal
  tooltipPos?: PlacesType
}) => {
  const tooltipPosition: PlacesType = tooltipPos || 'right'
  return (
    <DisabledSiteMenuItem $active={false} data-tooltip-id={`menu-item.${navItem.id}.${tooltipPosition}`}>
      <Tooltip id={`menu-item.${navItem.id}.${tooltipPosition}`} clickable place={tooltipPosition}>
        <div>{siteSettingsDataPortal?.tooltipText}</div>
        <div>
          <a style={{ textDecoration: 'underline' }} href={`mailto:${siteSettingsDataPortal?.mailto}`}>
            Reach out to the FDA for access.
          </a>
        </div>
      </Tooltip>
      <IconWrap>
        <navItem.icon height={navItem.iconHeight} />
      </IconWrap>
      <SiteMenuText>{navItem.text}</SiteMenuText>
    </DisabledSiteMenuItem>
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
    <DisabledMenuItem key={navItem.id} navItem={navItem} siteSettingsDataPortal={siteSettingsDataPortal} tooltipPos="bottom" />
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
  className,
  setShowSiteNav,
  ignoredOutsideClickRef,
  isSiteAdmin = false,
}: {
  className: string
  setShowSiteNav: (v: boolean, ms?: number) => void
  ignoredOutsideClickRef: React.RefObject<HTMLElement> | React.RefObject<HTMLButtonElement | null>
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
    <StyledSiteNav className={className} ref={clickRef}>
      <SiteNavTop>
        <div />
        <TransparentButton onClick={() => setShowSiteNav(false, 100)}>
          <CrossIcon height={16} />
        </TransparentButton>
      </SiteNavTop>
      <SiteNavBody>
        <Row>
          <div>
            {getObjectsByIds(['overview', 'data-portals', 'discussions', 'challenges', 'experts'], userSiteNavItems).map(i => (
              <MenuItem key={i.id} navItem={i} pathname={pathname} onClick={() => setShowSiteNav(false)} />
            ))}
            <HeaderSpacer />
            {getObjectsByIds(['home', 'spaces'], userSiteNavItems).map(i => (
              <MenuItem key={i.id} navItem={i} pathname={pathname} onClick={() => setShowSiteNav(false)} />
            ))}
            <HeaderSpacer />
            {getObjectsByIds(['notes', 'comparisons'], userSiteNavItems).map(i => (
              <MenuItem key={i.id} navItem={i} pathname={pathname} onClick={() => setShowSiteNav(false)} />
            ))}
            <HeaderSpacer />
            {getObjectsByIds(['docs', 'support'], userSiteNavItems).map(i => (
              <MenuItem key={i.id} navItem={i} pathname={pathname} onClick={() => setShowSiteNav(false)} />
            ))}
          </div>
          <div>
            {getObjectsByIds(portalIDs, userSiteNavItems).map(i =>
              dataPortalMenuItem(i, pathname, setShowSiteNav, siteSettings?.dataPortals[i.id]),
            )}
            <HeaderSpacer />

            {showGSRSLink &&
              getObjectsByIds(['gsrs'], userSiteNavItems).map(i => (
                <MenuItem key={i.id} navItem={i} pathname={pathname} onClick={() => setShowSiteNav(false)} />
              ))}
            <HeaderSpacer />
            {showCDMHLink && (
              <>
                <Tooltip id="menu-item.cdmh.right" clickable place="right">
                  <div>This is the Common Data Model Harmonization; access is currently restricted to FDA users.</div>
                  <div>
                    <a
                      style={{ textDecoration: 'underline' }}
                      href="mailto:mitra.rocca@fda.hhs.gov?cc=precisionFDA@fda.hhs.gov&subject=CDMH access request"
                    >
                      Reach out to the FDA for access.
                    </a>
                  </div>
                </Tooltip>
                <SiteMenuItem $active={false} className="noHover" data-tooltip-id="menu-item.cdmh.right">
                  <IconWrap>
                    <CDMHIcon height={20} />
                  </IconWrap>
                  <SiteMenuText>CDMH</SiteMenuText>
                </SiteMenuItem>
                {Object.entries(siteSettings?.cdmh?.data ?? {}).map(([key, url]) => (
                  <SubLink as="a" key={key} target="_blank" rel="noreferrer" href={url}>
                    {CDMHNames[key as CDMHKey]}&nbsp;
                    <ArrowLeftIcon />
                  </SubLink>
                ))}
                <HeaderSpacer />
              </>
            )}
          </div>
        </Row>
      </SiteNavBody>
      <SiteNavBottom>
        <div />
        <ThemeToggle />
      </SiteNavBottom>
    </StyledSiteNav>
  )
}

const Header: React.FC = () => {
  const [showSiteNav, setShowSiteNav] = useState(false)
  const { pathname } = useLocation()
  const user = useAuthUser()
  const siteSettings = useSiteSettingsQuery()
  const { isAlertDismissed, setIsAlertDismissed } = useAlertDismissed()
  const { selFavorites } = useNavFavorites()
  const [isCloudResourcesModalShown, setCloudResourcesModalShown] = useState(false)
  const buttonElement = useRef<HTMLButtonElement>(null)
  const generateCLIKeyAction = useGenerateKeyModal()
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

  const orderedFavorites = getOrderedFavoritesOnly(selFavorites)

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
        className={classNames({ enter: showSiteNav, exit: !showSiteNav })}
        ignoredOutsideClickRef={buttonElement}
        setShowSiteNav={setSidebar}
        isSiteAdmin={userCanAdministerSite}
      />
      <StyledHeader data-testid="main-header">
        <Nav>
          <LogoWrap as={Link} to="/" data-turbolinks="false">
            <StyledHeaderLogo height={20} />
          </LogoWrap>
          <MenuButton
            $active={showSiteNav}
            data-testid="button-open-menu"
            ref={buttonElement}
            onClick={() => setSidebar(!showSiteNav, 100)}
          >
            <SiteMenuIcon height={20} />
          </MenuButton>
          <HeaderLeft>
            {getObjectsByIds(orderedFavorites, userSiteNavItems).map(i => {
              if (siteSettings?.data?.dataPortals[i.id]?.accessible === false) {
                return <DisabledTopMenuItem key={i.id} navItem={i} siteSettingsDataPortal={siteSettings.data.dataPortals[i.id]} />
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

              return (
                <MenuLink navItem={dynamicNavItem} key={id} data-testid={`favoritenav-${id}`}>
                  <HeaderMenuItem $active={isActiveLink(navigationPath, pathname)}>
                    <IconWrap $marginBottom={1}>
                      <Icon height={iconHeight} />
                    </IconWrap>
                    <SiteMenuText>{text}</SiteMenuText>
                  </HeaderMenuItem>
                </MenuLink>
              )
            })}
            <EditMenuWrap>
              <TransparentButton
                data-testid="button-edit-menu-favorites"
                onClick={() => setShowModal(!isShown)}
                title="Edit Favorites"
              >
                <StarIcon height={14} />
              </TransparentButton>
            </EditMenuWrap>
          </HeaderLeft>
          <HeaderRight>
            <HeaderMenuItem
              as={TransparentButton}
              $active={isSearchShown}
              onClick={() => setShowSearch(true)}
              data-testid="search-button"
            >
              <SearchIcon />
            </HeaderMenuItem>
            <Menu
              positioner={{ sideOffset: 3, side: 'bottom', align: 'end' }}
              trigger={
                <Menu.Trigger>
                  <DropdownMenuItem $active={false} data-testid="user-context-menu">
                    <IconWrap>
                      <ProfileIcon height={16} />
                    </IconWrap>
                    <HeaderItemText>
                      {getUsername(user)}
                      <CaretIcon height={6} />
                    </HeaderItemText>
                  </DropdownMenuItem>
                </Menu.Trigger>
              }
            >
              <UserMenu
                user={user}
                userCanAdministerSite={userCanAdministerSite}
                handleLogout={handleLogout}
                showCloudResourcesModal={() => setCloudResourcesModalShown(true)}
                generateCLIKey={() => generateCLIKeyAction.setShowModal(true)}
              />
            </Menu>
          </HeaderRight>
        </Nav>
      </StyledHeader>
      <CloudResourceModal
        isShown={isCloudResourcesModalShown}
        hide={() => {
          setCloudResourcesModalShown(false)
        }}
      />
      {generateCLIKeyAction.modalComp}
    </>
  )
}

export default Header
