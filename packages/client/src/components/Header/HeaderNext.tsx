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
import { useTheme } from '../../utils/ThemeContext'
import { AlertBanner } from '../AlertBanner'
import { TransparentButton } from '../Button'
import { CloudResourceModal } from '../CloudResourcesModal'
import { DropdownNext } from '../Dropdown/DropdownNext'
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon'
import { CDMHIcon } from '../icons/CDMHIcon'
import { CaretIcon } from '../icons/CaretIcon'
import { DarkModeIcon, LightModeIcon } from '../icons/ColorModes'
import { CrossIcon } from '../icons/PlusIcon'
import { ProfileIcon } from '../icons/ProfileIcon'
import { SiteMenuIcon } from '../icons/SiteMenuIcon'
import { StarIcon } from '../icons/StarIcon'
import { SiteNavItemType } from './NavItems'
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
  StyledToggle,
  StyledToggleButton,
  SubLink,
} from './styles'
import { useEditFavoritesModal } from './useEditFavoritesModal'
import { useNavFavorites } from './useNavFavorites'
import { useUserSiteNavItems } from './useUserSiteNavItems'

type UserMenuProps = {
  user: IUser | null | undefined
  userCanAdministerSite?: boolean
  handleLogout: () => void
  showCloudResourcesModal: () => void
  generateCLIKey: () => void
  hide: () => void
}

export const UserMenu = ({
  user,
  userCanAdministerSite = false,
  handleLogout,
  showCloudResourcesModal,
  generateCLIKey,
  hide,
}: UserMenuProps) => (
  <StyledDropMenuLinks>
    <StyledLink data-turbolinks="false" href="/profile" onClick={() => hide()}>
      Profile
    </StyledLink>
    {user && (
      <>
        <StyledLink data-turbolinks="false" href={`/users/${user?.dxuser}`} onClick={() => hide()}>
          Public Profile
        </StyledLink>
        <StyledOnClickModalDiv
          onClick={() => {
            showCloudResourcesModal()
            hide()
          }}
        >
          Cloud Resources
        </StyledOnClickModalDiv>
      </>
    )}
    <StyledLink
      as="div"
      onClick={() => {
        generateCLIKey()
        hide()
      }}
    >
      Generate CLI Key
    </StyledLink>
    <StyledLink data-turbolinks="false" href="/licenses" onClick={() => hide()}>
      Manage Licenses
    </StyledLink>
    <StyledLink as={Link} data-turbolinks="false" to="/account/notifications" onClick={() => hide()}>
      Notification Settings
    </StyledLink>
    <StyledDivider />
    <StyledLink as={Link} to="/about" data-turbolinks="false" onClick={() => hide()}>
      About
    </StyledLink>
    <StyledLink data-turbolinks="false" href="/guidelines" onClick={() => hide()}>
      Guidelines
    </StyledLink>
    <StyledLink as="a" target="_blank" href="/docs" data-turbolinks="false" onClick={() => hide()}>
      Docs
    </StyledLink>
    <StyledDivider />
    {userCanAdministerSite && (
      <>
        <StyledLink as={Link} to="/admin" onClick={() => hide()}>
          Admin Dashboard
        </StyledLink>
        <StyledDivider />
      </>
    )}
    <StyledLink
      as="div"
      onClick={() => {
        hide()
        handleLogout()
      }}
    >
      Log Out
    </StyledLink>
  </StyledDropMenuLinks>
)

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
  const MenuLinkComp = navItem?.alink ? 'a' : Link
  const menuLinkProps = {
    rel: navItem.alink?.startsWith('mailto:') ? 'noreferrer' : undefined,
    target: navItem?.external ? '_blank' : undefined,
    onClick,
    href: navItem?.alink,
    to: navItem.link,
    title: navItem.text,
    'data-testid': rest['data-testid'],
  }
  return <MenuLinkComp {...menuLinkProps}>{children}</MenuLinkComp>
}

const MenuItem = ({ navItem, pathname, onClick }: { navItem: SiteNavItemType; pathname: string; onClick: () => void }) => {
  return (
    <MenuLink navItem={navItem} onClick={onClick} data-testid={`sitenav-${navItem.id}`}>
      <SiteMenuItem $active={isActiveLink(navItem?.link || navItem.alink, pathname)}>
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
  siteSettingsDataPortal: SiteSettingsDataPortal,
) => {
  if (siteSettingsDataPortal?.accessible) {
    return <MenuItem key={i.id} navItem={i} pathname={pathname} onClick={() => setShowSiteNav(false)} />
  }
  return <DisabledMenuItem key={i.id} navItem={i} siteSettingsDataPortal={siteSettingsDataPortal} />
}

const getUsername = (user: IUser) => {
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
  ignoredOutsideClickRef: HTMLDivElement | null
  isSiteAdmin: boolean
}) => {
  const { theme, toggleTheme } = useTheme()
  const clickRef = useOnOutsideClickRef(true, setShowSiteNav, ignoredOutsideClickRef)
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
                <SiteMenuItem className="noHover" data-tooltip-id="menu-item.cdmh.right">
                  <IconWrap>
                    <CDMHIcon height={20} />
                  </IconWrap>
                  <SiteMenuText>CDMH</SiteMenuText>
                </SiteMenuItem>
                {siteSettings?.cdmh?.data &&
                  Object.keys(siteSettings.cdmh.data).map((s: CDMHKey) => {
                    return (
                      <SubLink as="a" key={s} target="_blank" rel="noreferrer" href={siteSettings.cdmh.data[s]}>
                        {CDMHNames[s]}&nbsp;
                        <ArrowLeftIcon />
                      </SubLink>
                    )
                  })}
                <HeaderSpacer />
              </>
            )}
          </div>
        </Row>
      </SiteNavBody>
      <SiteNavBottom>
        <div />
        <StyledToggle>
          <StyledToggleButton data-active={theme === 'light'} onClick={() => toggleTheme()}>
            <LightModeIcon height={16} />
          </StyledToggleButton>
          <StyledToggleButton data-active={theme === 'dark'} onClick={() => toggleTheme()}>
            <DarkModeIcon height={16} />
          </StyledToggleButton>
        </StyledToggle>
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
  const buttonRef = useRef<HTMLDivElement>(null)
  const generateCLIKeyAction = useGenerateKeyModal()
  const { isShown, modalComp, setShowModal } = useEditFavoritesModal()
  const { userSiteNavItems } = useUserSiteNavItems()

  if (!user) return null

  const userCanAdministerSite = user.can_administer_site
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
      {showAlertBanner && (
        <AlertBanner
          variant={siteSettings.data?.alerts[0].type}
          dismissAlert={() => setIsAlertDismissed(true)}
          alertText={siteSettings.data?.alerts[0].content}
        />
      )}
      <SiteNav
        isSiteAlertVisible={showAlertBanner}
        className={classNames({ enter: showSiteNav, exit: !showSiteNav })}
        ignoredOutsideClickRef={buttonRef}
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
            ref={buttonRef}
            onClick={() => setSidebar(!showSiteNav, 100)}
          >
            <SiteMenuIcon height={20} />
          </MenuButton>
          <HeaderLeft>
            {getObjectsByIds(orderedFavorites, userSiteNavItems).map(i => {
              if (siteSettings?.data?.dataPortals[i.id]?.accessible === false) {
                return <DisabledTopMenuItem key={i.id} navItem={i} siteSettingsDataPortal={siteSettings.data.dataPortals[i.id]} />
              }

              // If CDMH item, get the correct link
              const normalizedId = i.id.replace(/-([a-z])/g, (_match, letter) => {
                return letter.toUpperCase()
              }) as CDMHKey
              const cdmhList = siteSettings.data?.cdmh.data
              if (cdmhList !== undefined && cdmhList[normalizedId] !== undefined) {
                i.link = cdmhList[normalizedId]
              }
              if (i.id === 'spaces' && !!user?.can_administer_site) {
                i.link = '/spaces?hidden=false'
              }

              const { id, iconHeight, text, icon: Icon } = i
              return (
                <MenuLink navItem={i} key={id} data-testid={`favoritenav-${id}`}>
                  <HeaderMenuItem $active={isActiveLink(i?.link || i.alink, pathname)}>
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
            <DropdownNext
              trigger="click"
              // eslint-disable-next-line react/no-unstable-nested-components
              content={(props, { hide }) => (
                <UserMenu
                  user={user}
                  userCanAdministerSite={userCanAdministerSite}
                  handleLogout={handleLogout}
                  showCloudResourcesModal={() => setCloudResourcesModalShown(true)}
                  generateCLIKey={() => generateCLIKeyAction.setShowModal(true)}
                  hide={hide}
                />
              )}
            >
              {dropdownProps => (
                <DropdownMenuItem {...dropdownProps} $active={dropdownProps.$isActive} data-testid="user-context-menu">
                  <IconWrap>
                    <ProfileIcon height={16} />
                  </IconWrap>
                  <HeaderItemText>
                    {getUsername(user)}
                    <CaretIcon height={6} />
                  </HeaderItemText>
                </DropdownMenuItem>
              )}
            </DropdownNext>
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
