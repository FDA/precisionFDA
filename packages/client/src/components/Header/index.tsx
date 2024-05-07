/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SUPPORT_EMAIL } from '../../constants'
import { useAlertDismissed } from '../../features/admin/alerts/useAlertDismissedLocalStorage'
import { CDMHKey, logout } from '../../features/auth/api'
import { useAuthUser } from '../../features/auth/useAuthUser'
import { useGenerateKeyModal } from '../../features/auth/useGenerateKeyModal'
import { CDMHNames, useSiteSettingsQuery } from '../../features/auth/useSiteSettingsQuery'
import { IUser } from '../../types/user'
import { AlertBanner } from '../AlertBanner'
import { CloudResourceModal } from '../CloudResourcesModal'
import Dropdown from '../Dropdown'
import { BullsEyeIcon } from '../icons/BullsEyeIcon'
import { CDMHIcon } from '../icons/CDMHIcon'
import { CaretIcon } from '../icons/CaretIcon'
import { CommentingIcon } from '../icons/CommentingIcon'
import { DataPortalIcon } from '../icons/DataPortalIcon'
import { DiscussionIcon } from '../icons/DiscussionIcon'
import { FortIcon } from '../icons/FortIcon'
import { GSRSIcon } from '../icons/GSRSIcon'
import { HomeIcon } from '../icons/HomeIcon'
import { ObjectGroupIcon } from '../icons/ObjectGroupIcon'
import { PrismIcon } from '../icons/PrismIcon'
import { ProfileIcon } from '../icons/ProfileIcon'
import { QuestionIcon } from '../icons/QuestionIcon'
import { StarIcon } from '../icons/StarIcon'
import { StickyNoteIcon } from '../icons/StickyNote'
import { ToolsIcon } from '../icons/ToolsIcon'
import { TrophyIcon } from '../icons/TrophyIcon'
import {
  DropdownMenuItem,
  HeaderItemText,
  HeaderLeft,
  HeaderRight,
  HeaderSpacer,
  IconWrap,
  LogoWrap,
  MenuItem,
  Nav,
  StyledDivider,
  StyledDropMenuLinks,
  StyledHeader,
  StyledHeaderLogo,
  StyledLink,
  StyledOnClickModalDiv,
} from './styles'

type UserMenuProps = {
  user: IUser | null | undefined
  userIsGuest?: boolean
  userCanAdministerSite?: boolean
  handleLogout: () => void
  showCloudResourcesModal: () => void
  generateCLIKey: () => void
}

export const UserMenu = ({
  user,
  userIsGuest = true,
  userCanAdministerSite = false,
  handleLogout,
  showCloudResourcesModal,
  generateCLIKey,
}: UserMenuProps) => (
  <StyledDropMenuLinks>
    <StyledLink data-turbolinks="false" href="/profile">
      Profile
    </StyledLink>
    {user && !userIsGuest && (
      <>
        <StyledLink data-turbolinks="false" href={`/users/${user?.dxuser}`}>
          Public Profile
        </StyledLink>
        <StyledOnClickModalDiv onClick={showCloudResourcesModal}>
          Cloud Resources
        </StyledOnClickModalDiv>
      </>
    )}
    <StyledLink as="div" onClick={generateCLIKey}>
      Generate CLI Key
    </StyledLink>
    <StyledLink data-turbolinks="false" href="/licenses">
      Manage Licenses
    </StyledLink>
    {!userIsGuest && (
      <StyledLink as={Link} data-turbolinks="false" to="/account/notifications">
        Notification Settings
      </StyledLink>
    )}
    <StyledDivider />
    <StyledLink as={Link} to="/about" data-turbolinks="false">
      About
    </StyledLink>
    <StyledLink data-turbolinks="false" href="/guidelines">
      Guidelines
    </StyledLink>
    <StyledLink as={Link} to="/docs" data-turbolinks="false">
      Docs
    </StyledLink>
    <StyledDivider />
    {userCanAdministerSite && (
      <>
        <StyledLink as={Link} to="/admin" data-turbolinks="false">
          Admin Dashboard
        </StyledLink>
        <StyledDivider />
      </>
    )}
    <StyledLink as="div" onClick={handleLogout}>
      Log Out
    </StyledLink>
  </StyledDropMenuLinks>
)

const getUsername = (user: IUser) => {
  if (user) {
    if (user.full_name === ' ') {
      return user.dxuser
    }
    return user.full_name
  }
  return '...'
}

const Header: React.FC = () => {
  const { pathname } = useLocation()
  const user = useAuthUser()
  const siteSettings = useSiteSettingsQuery()
  const [isCloudResourcesModalShown, setCloudResourcesModalShown] = useState(false)
  const { isAlertDismissed, setIsAlertDismissed } = useAlertDismissed()

  const userCanAdministerSite = user?.can_administer_site
  const userIsGuest = user?.is_guest
  const isSpacesPath = pathname.startsWith('/spaces')
  const isDataPortalsPath = pathname.startsWith('/data-portals')

  const handleLogout = async () => {
    setIsAlertDismissed(false)
    await logout().then(() => {
      window.location.replace('/')
    })
  }

  const generateCLIKeyAction = useGenerateKeyModal()

  const isActiveLink = (linkPath: string) => {
    if (linkPath === '/') {
      // Special case
      return pathname === linkPath
    }
    return pathname.startsWith(linkPath)
  }

  if (!user) return null

  const showGSRSLink = !isSpacesPath && !isDataPortalsPath && !userIsGuest
  const showCDMHLink = !isSpacesPath && !isDataPortalsPath && !!siteSettings?.data?.cdmh.isEnabled
  const showAlertBanner = !isAlertDismissed && siteSettings.data?.alerts?.[0]

  return (
    <>
      {showAlertBanner && <AlertBanner variant={siteSettings.data?.alerts[0].type} dismissAlert={() => setIsAlertDismissed(true)} alertText={siteSettings.data?.alerts[0].content} />}
      <StyledHeader data-testid="main-header">
        <Nav>
          <LogoWrap as={Link} to="/" data-turbolinks="false">
            <StyledHeaderLogo />
          </LogoWrap>
          <HeaderLeft>
            <Link
              to={isSpacesPath || isDataPortalsPath ? '/home' : '/'}
              title={isSpacesPath || isDataPortalsPath ? 'Back Home' : 'Overview'}
              data-turbolinks="false"
            >
              <MenuItem $active={isActiveLink('/')}>
                <IconWrap>
                  {isSpacesPath || isDataPortalsPath ? <FortIcon height={16} /> : <HomeIcon height={16} />}
                </IconWrap>
                <HeaderItemText>
                  {isSpacesPath || isDataPortalsPath ? 'Back Home' : 'Overview'}
                </HeaderItemText>
              </MenuItem>
            </Link>
            {!isSpacesPath && !isDataPortalsPath && (
              <>
                <a
                  data-turbolinks="false"
                  href="/discussions"
                  title="Discussions"
                >
                  <MenuItem $active={isActiveLink('/discussions')}>
                    <IconWrap>
                      <DiscussionIcon height={16} />
                    </IconWrap>
                    <HeaderItemText>Discussions</HeaderItemText>
                  </MenuItem>
                </a>
                <Link
                  to="/challenges"
                  title="Challenges"
                  data-turbolinks="false"
                >
                  <MenuItem $active={isActiveLink('/challenges')}>
                    <IconWrap>
                      <TrophyIcon height={16} />
                    </IconWrap>
                    <HeaderItemText>Challenges</HeaderItemText>
                  </MenuItem>
                </Link>
                <Link to="/experts" title="Experts" data-turbolinks="false">
                  <MenuItem $active={isActiveLink('/experts')}>
                    <IconWrap>
                      <StarIcon height={16} />
                    </IconWrap>
                    <HeaderItemText>Experts</HeaderItemText>
                  </MenuItem>
                </Link>
                <HeaderSpacer />
                <Link to="/home" title="My Home" data-turbolinks="false">
                  <MenuItem $active={isActiveLink('/home')}>
                    <IconWrap>
                      <FortIcon height={16} />
                    </IconWrap>
                    <HeaderItemText>My Home</HeaderItemText>
                  </MenuItem>
                </Link>
                <HeaderSpacer />
                <a data-turbolinks="false" href="/notes" title="Notes">
                  <MenuItem $active={isActiveLink('/notes')}>
                    <IconWrap>
                      <StickyNoteIcon height={16} />
                    </IconWrap>
                    <HeaderItemText>Notes</HeaderItemText>
                  </MenuItem>
                </a>
                <a
                  data-turbolinks="false"
                  href="/comparisons"
                  title="Comparisons"
                >
                  <MenuItem $active={isActiveLink('/comparisons')}>
                    <IconWrap>
                      <BullsEyeIcon height={16} />
                    </IconWrap>
                    <HeaderItemText>Comparisons</HeaderItemText>
                  </MenuItem>
                </a>
              </>
            )}
            <HeaderSpacer />
            <Link to="/spaces" title="Spaces" data-turbolinks="false">
              <MenuItem $active={isActiveLink('/spaces')}>
                <IconWrap>
                  <ObjectGroupIcon height={16} />
                </IconWrap>
                <HeaderItemText>Spaces</HeaderItemText>
              </MenuItem>
            </Link>
            {showGSRSLink && (
              <a
                data-turbolinks="false"
                href="/ginas/app/beta"
                target="_blank"
                title="GSRS"
              >
                <MenuItem>
                  <IconWrap>
                    <GSRSIcon height={16} />
                  </IconWrap>
                  <HeaderItemText>GSRS</HeaderItemText>
                </MenuItem>
              </a>
            )}
            {showCDMHLink && (
              <Dropdown
                trigger="click"
                content={
                  <StyledDropMenuLinks>
                    {siteSettings?.data?.cdmh && Object.keys(siteSettings.data.cdmh.data).map((s: CDMHKey) => {
                      return <StyledLink key={s} target="_blank" rel="noreferrer" href={siteSettings.data.cdmh.data[s]}>{CDMHNames[s]}</StyledLink>
                    })}
                  </StyledDropMenuLinks>
                }
              >
                {dropdownProps => (
                  <DropdownMenuItem
                    {...dropdownProps}
                    $active={dropdownProps.isActive}
                  >
                    <IconWrap>
                      <CDMHIcon height={20} />
                    </IconWrap>
                    <HeaderItemText>
                      CDMH
                      <CaretIcon height={6} />
                    </HeaderItemText>
                  </DropdownMenuItem>
                )}
              </Dropdown>
            )}

            <Link to="/data-portals/daaas" title="Data Portals">
              <MenuItem $active={isActiveLink('/data-portals/DAaaS') || isActiveLink('/data-portals/daaas')}>
                <IconWrap>
                  <DataPortalIcon height={18} />
                </IconWrap>
                <HeaderItemText>DAaaS</HeaderItemText>
              </MenuItem>
            </Link>
            <Link
              to="/data-portals/prism"
              title="PRISM"
              >
              <MenuItem $active={isActiveLink('/data-portals/prism')}>
                <IconWrap>
                  <PrismIcon height={17} />
                </IconWrap>
                <HeaderItemText>PRISM</HeaderItemText>
              </MenuItem>
            </Link>
            <Link
              to="/data-portals/tools"
              title="Tools"
              >
              <MenuItem $active={isActiveLink('/data-portals/tools')}>
                <IconWrap>
                  <ToolsIcon height={16} />
                </IconWrap>
                <HeaderItemText>Tools</HeaderItemText>
              </MenuItem>
            </Link>
          </HeaderLeft>
          <HeaderRight>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              target="_blank"
              title="Support"
              rel="noreferrer"
              >
              <MenuItem>
                <IconWrap>
                  <CommentingIcon height={16} />
                </IconWrap>
                <HeaderItemText>Support</HeaderItemText>
              </MenuItem>
            </a>
            <Link
              to="/docs/introduction"
              title="Get Started"
              data-turbolinks="false"
            >
              <MenuItem $active={isActiveLink('/docs/introduction')}>
                <IconWrap>
                  <QuestionIcon height={16} />
                </IconWrap>
                <HeaderItemText>Get Started</HeaderItemText>
              </MenuItem>
            </Link>
            <Dropdown
              trigger="click"
              content={
                <UserMenu
                  user={user}
                  userCanAdministerSite={userCanAdministerSite}
                  userIsGuest={userIsGuest}
                  handleLogout={handleLogout}
                  showCloudResourcesModal={() => setCloudResourcesModalShown(true)}
                  generateCLIKey={() => generateCLIKeyAction.setShowModal(true)}
                />
              }
            >
              {dropdownProps => (
                <DropdownMenuItem
                  {...dropdownProps}
                  $active={dropdownProps.isActive}
                >
                  <IconWrap>
                    <ProfileIcon height={16} />
                  </IconWrap>
                  <HeaderItemText>
                    {getUsername(user)}
                    <CaretIcon height={6} />
                  </HeaderItemText>
                </DropdownMenuItem>
              )}
            </Dropdown>
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
