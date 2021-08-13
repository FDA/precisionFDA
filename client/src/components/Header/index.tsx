import React from 'react'
import {
  HeaderItemText,
  HeaderLeft,
  MenuItem,
  HeaderRight,
  HeaderSpacer,
  Nav,
  StyledHeader,
  StyledHeaderLogo,
  StyledLinkReactRoute,
  StyledDropMenuLinks,
  StyledLink,
  StyledDivider,
  AvatarMenuItem,
  IconWrap,
  LogoWrap,
} from './styles'
import Dropdown from '../Dropdown'
import { HomeIcon } from '../icons/HomeIcon'
import { ProfileIcon } from '../icons/ProfileIcon'
import { CommentIcon } from '../icons/CommentIcon'
import { TrophyIcon } from '../icons/TrophyIcon'
import { StarIcon } from '../icons/StarIcon'
import { StickyNoteIcon } from '../icons/StickyNote'
import { BullsEyeIcon } from '../icons/BullsEyeIcon'
import { FortIcon } from '../icons/FortIcon'
import { ObjectGroupIcon } from '../icons/ObjectGroupIcon'
import { CommentingIcon } from '../icons/CommentingIcon'
import { CaretIcon } from '../icons/CaretIcon'
import { Link, matchPath, useLocation } from 'react-router-dom'
import { SUPPORT_EMAIL } from '../../constants'
import { QuestionIcon } from '../icons/QuestionIcon'
import { useSelector } from 'react-redux'
import {
  contextUserSelector,
  isInitializedSelector,
} from '../../reducers/context/selectors'
import { logout } from '../../features/auth/api'

const getUsername = (user: any) => {
  if (user) {
    if (user.full_name === ' ') {
      return user.dxuser
    } else {
      return user.full_name
    }
  }
  return '...'
}

export const Header: React.FC = () => {
  const pathname = useLocation().pathname
  const init = useSelector(isInitializedSelector)
  const user = useSelector(contextUserSelector)

  const userCanAdministerSite = user?.can_administer_site
  const userCanSeeSpaces = user?.can_see_spaces
  const userIsGuest = user?.is_guest
  const isSpacesPath = pathname.startsWith('/spaces')

  const handleLogout = async () => {
    await logout().then(() => {
      window.location.replace('/')
    })
  }

  const renderUserMenu = () => (
    <StyledDropMenuLinks>
      <StyledLink href="/profile">Profile</StyledLink>
      {user && !userIsGuest && (
        <StyledLink href={`/users/${user!.dxuser}`}>Public Profile</StyledLink>
      )}
      <StyledLink href="/licenses">Manage Licenses</StyledLink>
      {!userIsGuest && (
        <StyledLinkReactRoute to="/account/notifications">
          Notification Settings
        </StyledLinkReactRoute>
      )}
      <StyledDivider />
      <StyledLink href="/about">About</StyledLink>
      <StyledLink href="/guidelines">Guidelines</StyledLink>
      <StyledLink href="/docs">Docs</StyledLink>
      <StyledDivider />
      {userCanAdministerSite && (
        <>
          <StyledLink href="/admin">Admin Dashboard</StyledLink>
          <StyledDivider />
        </>
      )}
      <StyledLink as="div" onClick={() => handleLogout()}>
        Log Out
      </StyledLink>
    </StyledDropMenuLinks>
  )

  const isActiveLink = (linkPath: string) => {
    if (linkPath == '/') {
      // Special case
      return pathname == linkPath
    }
    return pathname.startsWith(linkPath)
  }

  if (!init) return null

  return (
    <StyledHeader>
      <Nav>
        <LogoWrap as={Link} to="/">
          <StyledHeaderLogo />
        </LogoWrap>
        <HeaderLeft>
          <Link to={isSpacesPath ? '/home' : '/'} title={isSpacesPath ? 'Back Home' : 'Overview'}>
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
              <Link to="/experts" title="Exoerts">
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
          {userCanSeeSpaces && (
            <>
              <HeaderSpacer />
              <Link to="/spaces" title="Spaces">
                <MenuItem active={isActiveLink('/spaces')}>
                  <IconWrap>
                    <ObjectGroupIcon height={16} />
                  </IconWrap>
                  <HeaderItemText>Spaces</HeaderItemText>
                </MenuItem>
              </Link>
            </>
          )}
        </HeaderLeft>
        <HeaderRight>
          <a href={`mailto:${SUPPORT_EMAIL}`} target="_blank" title="Support">
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
          <Dropdown trigger="click" content={renderUserMenu()}>
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
  )
}
