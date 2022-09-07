/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { SUPPORT_EMAIL } from '../../constants'
import { logout } from '../../features/auth/api'
import { useAuthUser } from '../../features/auth/useAuthUser'
import { IUser } from '../../types/user'
import { CloudResourceModal } from '../CloudResourcesModal'
import Dropdown from '../Dropdown'
import { BullsEyeIcon } from '../icons/BullsEyeIcon'
import { CaretIcon } from '../icons/CaretIcon'
import { CommentIcon } from '../icons/CommentIcon'
import { CommentingIcon } from '../icons/CommentingIcon'
import { FortIcon } from '../icons/FortIcon'
import { GSRSIcon } from '../icons/GSRSIcon'
import { HomeIcon } from '../icons/HomeIcon'
import { ObjectGroupIcon } from '../icons/ObjectGroupIcon'
import { ProfileIcon } from '../icons/ProfileIcon'
import { QuestionIcon } from '../icons/QuestionIcon'
import { StarIcon } from '../icons/StarIcon'
import { StickyNoteIcon } from '../icons/StickyNote'
import { TrophyIcon } from '../icons/TrophyIcon'
import {
  AvatarMenuItem,
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
  StyledLinkReactRoute,
  StyledOnClickModalDiv,
} from './styles'

type UserMenuProps = {
  user: IUser | null | undefined
  userIsGuest: boolean
  userCanAdministerSite: boolean
  handleLogout: () => void
  showCloudResourcesModal: () => void
}

export const UserMenu = ({
  user,
  userIsGuest,
  userCanAdministerSite,
  handleLogout,
  showCloudResourcesModal,
}: UserMenuProps) => (
  <StyledDropMenuLinks>
    <StyledLink href="/profile">Profile</StyledLink>
    {user && !userIsGuest && (
      <>
        <StyledLink href={`/users/${user?.dxuser}`}>Public Profile</StyledLink>
        <StyledOnClickModalDiv onClick={showCloudResourcesModal}>
          Cloud Resources
        </StyledOnClickModalDiv>
      </>
    )}
    <StyledLink href="/licenses">Manage Licenses</StyledLink>
    {!userIsGuest && (
      <StyledLinkReactRoute to="/account/notifications">
        Notification Settings
      </StyledLinkReactRoute>
    )}
    <StyledDivider />
    <StyledLinkReactRoute to="/about">About</StyledLinkReactRoute>
    <StyledLink href="/guidelines">Guidelines</StyledLink>
    <StyledLink href="/docs">Docs</StyledLink>
    <StyledDivider />
    {userCanAdministerSite && (
      <>
        <StyledLink href="/admin">Admin Dashboard</StyledLink>
        <StyledDivider />
      </>
    )}
    <StyledLink as="div" onClick={handleLogout}>
      Log Out
    </StyledLink>
  </StyledDropMenuLinks>
)

const getUsername = (user: any) => {
  if (user) {
    if (user.full_name === ' ') {
      return user.dxuser
    }
    return user.full_name
  }
  return '...'
}

export const Header: React.FC = () => {
  const { pathname } = useLocation()
  const user = useAuthUser()
  const [isCloudResourcesModalShown, setCloudResourcesModalShown] =
    useState(false)

  const userCanAdministerSite = user?.can_administer_site
  const userIsGuest = user?.is_guest
  const isSpacesPath = pathname.startsWith('/spaces')

  const handleLogout = async () => {
    await logout().then(() => {
      window.location.replace('/')
    })
  }

  const isActiveLink = (linkPath: string) => {
    if (linkPath === '/') {
      // Special case
      return pathname === linkPath
    }
    return pathname.startsWith(linkPath)
  }

  if (!user) return null

  const showGSRSLink = !isSpacesPath && !userIsGuest

  return (
    <>
      <StyledHeader>
        <Nav>
          <LogoWrap as={Link} to="/">
            <StyledHeaderLogo />
          </LogoWrap>
          <HeaderLeft>
            <Link
              to={isSpacesPath ? '/home' : '/'}
              title={isSpacesPath ? 'Back Home' : 'Overview'}
            >
              <MenuItem active={isActiveLink('/')}>
                <IconWrap>
                  <HomeIcon height={16} />
                </IconWrap>
                <HeaderItemText>
                  {isSpacesPath ? 'Back Home' : 'Overview'}
                </HeaderItemText>
              </MenuItem>
            </Link>
            {!isSpacesPath && (
              <>
                <a href="/discussions" title="Discussions">
                  <MenuItem active={isActiveLink('/discussions')}>
                    <IconWrap>
                      <CommentIcon height={16} />
                    </IconWrap>
                    <HeaderItemText>Discussions</HeaderItemText>
                  </MenuItem>
                </a>
                <Link to="/challenges" title="Challenges">
                  <MenuItem active={isActiveLink('/challenges')}>
                    <IconWrap>
                      <TrophyIcon height={16} />
                    </IconWrap>
                    <HeaderItemText>Challenges</HeaderItemText>
                  </MenuItem>
                </Link>
                <Link to="/experts" title="Experts">
                  <MenuItem active={isActiveLink('/experts')}>
                    <IconWrap>
                      <StarIcon height={16} />
                    </IconWrap>
                    <HeaderItemText>Experts</HeaderItemText>
                  </MenuItem>
                </Link>
                <HeaderSpacer />
                <Link to="/home" title="My Home">
                  <MenuItem active={isActiveLink('/home')}>
                    <IconWrap>
                      <FortIcon height={16} />
                    </IconWrap>
                    <HeaderItemText>My Home</HeaderItemText>
                  </MenuItem>
                </Link>
                <HeaderSpacer />
                <a href="/notes" title="Notes">
                  <MenuItem active={isActiveLink('/notes')}>
                    <IconWrap>
                      <StickyNoteIcon height={16} />
                    </IconWrap>
                    <HeaderItemText>Notes</HeaderItemText>
                  </MenuItem>
                </a>
                <a href="/comparisons" title="Comparisons">
                  <MenuItem active={isActiveLink('/comparisons')}>
                    <IconWrap>
                      <BullsEyeIcon height={16} />
                    </IconWrap>
                    <HeaderItemText>Comparisons</HeaderItemText>
                  </MenuItem>
                </a>
              </>
            )}
            <HeaderSpacer />
            <Link to="/spaces" title="Spaces">
              <MenuItem active={isActiveLink('/spaces')}>
                <IconWrap>
                  <ObjectGroupIcon height={16} />
                </IconWrap>
                <HeaderItemText>Spaces</HeaderItemText>
              </MenuItem>
            </Link>
            {showGSRSLink && (
              <a href="/ginas/app/beta" target="_blank" title="GSRS">
                <MenuItem>
                  <IconWrap>
                    <GSRSIcon height={16} />
                  </IconWrap>
                  <HeaderItemText>GSRS</HeaderItemText>
                </MenuItem>
              </a>
            )}
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
            <a href="/docs" title="Get Started">
              <MenuItem active={isActiveLink('/docs')}>
                <IconWrap>
                  <QuestionIcon height={16} />
                </IconWrap>
                <HeaderItemText>Get Started</HeaderItemText>
              </MenuItem>
            </a>
            <Dropdown
              trigger="click"
              content={
                <UserMenu
                  user={user}
                  userCanAdministerSite={userCanAdministerSite}
                  userIsGuest={userIsGuest}
                  handleLogout={handleLogout}
                  showCloudResourcesModal={() =>
                    setCloudResourcesModalShown(true)
                  }
                />
              }
            >
              {dropdownProps => (
                <AvatarMenuItem
                  {...dropdownProps}
                  active={dropdownProps.isActive}
                >
                  <IconWrap>
                    <ProfileIcon height={16} />
                  </IconWrap>
                  <HeaderItemText>
                    {getUsername(user)}
                    <CaretIcon height={6} />
                  </HeaderItemText>
                </AvatarMenuItem>
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
    </>
  )
}
