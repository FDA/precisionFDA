import classNames from 'classnames'
import React, { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAlertDismissed } from '../../features/admin/alerts/useAlertDismissedLocalStorage'
import { CDMHKey, logout } from '../../features/auth/api'
import { useAuthUser } from '../../features/auth/useAuthUser'
import { useGenerateKeyModal } from '../../features/auth/useGenerateKeyModal'
import { CDMHNames, useSiteSettingsQuery } from '../../features/auth/useSiteSettingsQuery'
import { useOnOutsideClickRef } from '../../hooks/useOnOutsideClick'
import { IUser } from '../../types/user'
import { AlertBanner } from '../AlertBanner'
import { TransparentButton } from '../Button'
import { CloudResourceModal } from '../CloudResourcesModal'
import { DropdownNext } from '../Dropdown/DropdownNext'
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon'
import { CDMHIcon } from '../icons/CDMHIcon'
import { CaretIcon } from '../icons/CaretIcon'
import { CrossIcon } from '../icons/PlusIcon'
import { ProfileIcon } from '../icons/ProfileIcon'
import { SiteMenuIcon } from '../icons/SiteMenuIcon'
import { StarIcon } from '../icons/StarIcon'
import { SiteNavItemType } from './NavItems'
import { orderArrayByReference } from './orderArrayByReference'
import { getObjectsByIds } from './orderObjectById'
import {
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
import { useNavFavoritesLocalStorage } from './useNavFavoritesLocalStorage'
import { useNavOrderLocalStorage } from './useNavOrderLocalStorage'
import { useUserSiteNavItems } from './useUserSiteNavItems'

type UserMenuProps = {
  user: IUser | null | undefined
  userIsGuest?: boolean
  userCanAdministerSite?: boolean
  handleLogout: () => void
  showCloudResourcesModal: () => void
  generateCLIKey: () => void
  hide: () => void
}

export const UserMenu = ({
  user,
  userIsGuest = true,
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
    {user && !userIsGuest && (
      <>
        <StyledLink data-turbolinks="false" href={`/users/${user?.dxuser}`} onClick={() => hide()}>
          Public Profile
        </StyledLink>
        <StyledOnClickModalDiv onClick={() => {
            showCloudResourcesModal()
            hide()
        }}>Cloud Resources</StyledOnClickModalDiv>
      </>
    )}
    <StyledLink as="div" onClick={() => {
      generateCLIKey()
      hide()
    }}>
      Generate CLI Key
    </StyledLink>
    <StyledLink data-turbolinks="false" href="/licenses" onClick={() => hide()}>
      Manage Licenses
    </StyledLink>
    {!userIsGuest && (
      <StyledLink as={Link} data-turbolinks="false" to="/account/notifications" onClick={() => hide()}>
        Notification Settings
      </StyledLink>
    )}
    <StyledDivider />
    <StyledLink as={Link} to="/about" data-turbolinks="false" onClick={() => hide()}>
      About
    </StyledLink>
    <StyledLink data-turbolinks="false" href="/guidelines" onClick={() => hide()}>
      Guidelines
    </StyledLink>
    <StyledLink as={Link} to="/docs" data-turbolinks="false" onClick={() => hide()}>
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
    <StyledLink as="div" onClick={() => {
      hide()
      handleLogout()
    }}>
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

const MenuLink = ({ navItem, onClick, children, ...rest }: {navItem: SiteNavItemType, onClick?: () => void, children: React.ReactNode, 'data-testid': string }) => {
  const MenuLinkComp = navItem.alink ? 'a' : Link
  const menuLinkProps = {
    rel: navItem.alink?.startsWith('mailto:') ? 'noreferrer' : undefined,
    target: navItem?.external ? '_blank': undefined,
    onClick,
    href: navItem?.alink,
    to: navItem.link,
    title: navItem.text,
    'data-testid': rest['data-testid'],
  }
  return (
    <MenuLinkComp {...menuLinkProps}>{children}</MenuLinkComp>
  )
}

const MenuItem = ({ navItem, pathname, onClick }: {navItem: SiteNavItemType, pathname: string, onClick: () => void }) => {
  return (
    <MenuLink navItem={navItem} onClick={onClick} data-testid={`sitenav-${navItem.id}`}>
      <SiteMenuItem $active={isActiveLink(navItem.link || navItem.alink , pathname)}>
        <IconWrap>
          <navItem.icon height={navItem.iconHeight} />
        </IconWrap>
        <SiteMenuText>{navItem.text}</SiteMenuText>
      </SiteMenuItem>
    </MenuLink>
  )
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
}: {
  className: string
  setShowSiteNav: (v: boolean, ms?: number) => void
  ignoredOutsideClickRef: HTMLDivElement | null
}) => {
  const clickRef = useOnOutsideClickRef(true, setShowSiteNav, ignoredOutsideClickRef)
  const { pathname } = useLocation()
  const siteSettings = useSiteSettingsQuery()
  const { userSiteNavItems, showCDMHLink, showGSRSLink } = useUserSiteNavItems()

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
            {getObjectsByIds(['overview', 'discussions', 'challenges', 'experts'], userSiteNavItems).map((i) => <MenuItem key={i.id} navItem={i} pathname={pathname} onClick={() => setShowSiteNav(false)} /> )}
            <HeaderSpacer />
            {getObjectsByIds(['home', 'spaces'], userSiteNavItems).map((i) => <MenuItem key={i.id} navItem={i} pathname={pathname} onClick={() => setShowSiteNav(false)} />)}
            <HeaderSpacer />
            {getObjectsByIds(['notes', 'comparisons'], userSiteNavItems).map((i) => <MenuItem key={i.id} navItem={i} pathname={pathname} onClick={() => setShowSiteNav(false)} />)}
            <HeaderSpacer />
            {getObjectsByIds(['docs', 'support'], userSiteNavItems).map((i) => <MenuItem key={i.id} navItem={i} pathname={pathname} onClick={() => setShowSiteNav(false)} />)}
          </div>
          <div>
            {getObjectsByIds(['daaas', 'prism', 'tools'], userSiteNavItems).map((i) => <MenuItem key={i.id} navItem={i} pathname={pathname} onClick={() => setShowSiteNav(false)} />)}
            <HeaderSpacer />

            {showGSRSLink && (
              getObjectsByIds(['gsrs'], userSiteNavItems).map((i) => <MenuItem key={i.id} navItem={i} pathname={pathname} onClick={() => setShowSiteNav(false)} />)
            )}
            <HeaderSpacer />
            {showCDMHLink && (
              <>
                <SiteMenuItem className='noHover'>
                  <IconWrap>
                    <CDMHIcon height={20} />
                  </IconWrap>
                  <SiteMenuText>CDMH</SiteMenuText>
                </SiteMenuItem>
                {siteSettings?.data?.cdmh?.data &&
                  Object.keys(siteSettings.data.cdmh.data).map((s: CDMHKey) => {
                    return (
                      <SubLink as="a" key={s} target="_blank" rel="noreferrer" href={siteSettings.data.cdmh.data[s]}>
                        {CDMHNames[s]}&nbsp;<ArrowLeftIcon />
                      </SubLink>
                    )
                  })}
                <HeaderSpacer />
              </>
            )}
          </div>
        </Row>
      </SiteNavBody>
    </StyledSiteNav>
  )
}

const Header: React.FC = () => {
  const [showSiteNav, setShowSiteNav] = useState(false)
  const { pathname } = useLocation()
  const user = useAuthUser()
  const siteSettings = useSiteSettingsQuery()
  const { isAlertDismissed, setIsAlertDismissed } = useAlertDismissed()
  const { selFavorites } = useNavFavoritesLocalStorage()
  const { order } = useNavOrderLocalStorage()
  const [isCloudResourcesModalShown, setCloudResourcesModalShown] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)
  const generateCLIKeyAction = useGenerateKeyModal()
  const { isShown, modalComp, setShowModal } = useEditFavoritesModal()
  const { userSiteNavItems } = useUserSiteNavItems()

  if (!user) return null

  const userCanAdministerSite = user.can_administer_site
  const userIsGuest = user.is_guest
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

  const orderedFavorites = orderArrayByReference(selFavorites, order)

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
      />
      <StyledHeader data-testid="main-header">
        <Nav>
          <LogoWrap as={Link} to="/" data-turbolinks="false">
            <StyledHeaderLogo height={20} />
          </LogoWrap>
          <MenuButton $active={showSiteNav} data-testid="button-open-menu" ref={buttonRef} onClick={() => setSidebar(!showSiteNav, 100)}>
            <SiteMenuIcon height={20} />
          </MenuButton>
          <HeaderLeft>
            {getObjectsByIds(orderedFavorites, userSiteNavItems).map(i => {
              const { id, iconHeight, text, icon: Icon } = i
              return (
                <MenuLink navItem={i} key={id} data-testid={`favoritenav-${id}`}>
                  <HeaderMenuItem $active={isActiveLink(i.link || i.alink, pathname)}>
                    <IconWrap $marginBottom={1}>
                      <Icon height={iconHeight} />
                    </IconWrap>
                    <SiteMenuText>{text}</SiteMenuText>
                  </HeaderMenuItem>
                </MenuLink>
              )
            })}
            <EditMenuWrap>
              <TransparentButton data-testid="button-edit-menu-favorites" onClick={() => setShowModal(!isShown)} title="Edit Favorites">
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
                  userIsGuest={userIsGuest}
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
