import React from 'react'
import { Avatar } from '../Avatar'
import {
  HeaderItemText,
  HeaderLeft,
  MenuItem,
  HeaderRight,
  HeaderSpacer,
  Nav,
  StyledHeader,
  StyledHeaderLogo,
  StyledUsername,
  StyledDropMenuLinks,
  StyledLink,
  StyledDivider,
} from './styles'
import { HomeIcon } from '../icons/HomeIcon'
import { CommentIcon } from '../icons/CommentIcon'
import { TrophyIcon } from '../icons/TrophyIcon'
import { StarIcon } from '../icons/StarIcon'
import { StickyNoteIcon } from '../icons/StickyNote'
import { BullsEyeIcon } from '../icons/BullsEyeIcon'
import { FortIcon } from '../icons/FortIcon'
import { ObjectGroupIcon } from '../icons/ObjectGroupIcon'
import { CommentingIcon } from '../icons/CommentingIcon'
import { CaretIcon } from '../icons/CaretIcon'
import Dropdown from '../Dropdown'
import { Link, useLocation } from 'react-router-dom'
import { SUPPORT_EMAIL } from '../../constants'


interface IHeader {
  user: any,
}

export const Header: React.FC<IHeader> = ({ user }) => {
  const userCanAdministerSite = user.can_administer_site
  const userCanSeeSpaces = user.can_see_spaces

  const renderUserMenu = () => (
    <StyledDropMenuLinks>
        <StyledLink href="/profile">Profile</StyledLink>
        <StyledLink href={`/users/${user.dxuser}`}>Public Profile</StyledLink>
        <StyledLink href="/licenses">Manage Licenses</StyledLink>
        <StyledLink href="/account/notifications">Notification Settings</StyledLink>
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
        <StyledLink href="/logout">Log Out</StyledLink>
    </StyledDropMenuLinks>
  )

  const pathname = useLocation().pathname
  const isActiveLink = (linkPath: string) => {
    if (linkPath == '/') { // Special case
      return pathname == linkPath
    }
    return pathname.startsWith(linkPath)
  }

  return (
    <StyledHeader>
      <Nav>
        <HeaderLeft>
          <StyledHeaderLogo />
          <Link to="/" title="Overview">
            <MenuItem active={isActiveLink('/')}>
              <HomeIcon />
              <HeaderItemText>Overview</HeaderItemText>
            </MenuItem>
          </Link>
          <Link to="/discussions" title="Discussions">
            <MenuItem active={isActiveLink('/discussions')}>
              <CommentIcon />
              <HeaderItemText>Discussions</HeaderItemText>
            </MenuItem>
          </Link>
          <Link to="/challenges" title="Challenges">
            <MenuItem active={isActiveLink('/challenges')}>
              <TrophyIcon />
              <HeaderItemText>Challenges</HeaderItemText>
            </MenuItem>
          </Link>
          <Link to="/experts" title="Exoerts">
            <MenuItem active={isActiveLink('/experts')}>
              <StarIcon />
              <HeaderItemText>Experts</HeaderItemText>
            </MenuItem>
          </Link>
          <HeaderSpacer />
          <Link to="/home" title="My Home">
            <MenuItem active={isActiveLink('/home')}>
              <FortIcon />
              <HeaderItemText>My Home</HeaderItemText>
            </MenuItem>
          </Link>
          <HeaderSpacer />
          <Link to="/notes" title="Notes">
            <MenuItem active={isActiveLink('/notes')}>
              <StickyNoteIcon />
              <HeaderItemText>Notes</HeaderItemText>
            </MenuItem>
          </Link>
          <Link to="/comparisons" title="Comparisons">
            <MenuItem active={isActiveLink('/comparisons')}>
              <BullsEyeIcon />
              <HeaderItemText>Comparisons</HeaderItemText>
            </MenuItem>
          </Link>
          {userCanSeeSpaces && (
          <>
          <HeaderSpacer />
          <Link to="/spaces" title="Spaces">
            <MenuItem active={isActiveLink('/spaces')}>
              <ObjectGroupIcon />
              <HeaderItemText>Spaces</HeaderItemText>
            </MenuItem>
          </Link>
          </>
          )}
        </HeaderLeft>
        <HeaderRight>
          <a href={`mailto:${SUPPORT_EMAIL}`} target="_blank" title="Support">
            <MenuItem>
              <CommentingIcon />
              <HeaderItemText>Support</HeaderItemText>
            </MenuItem>
          </a>
          <a href="/docs" title="Get Started">
            <MenuItem active={isActiveLink('/docs')}>
              {/* TODO: Add Question Mark Icon */}
              <HeaderItemText>Get Started</HeaderItemText>
            </MenuItem>
          </a>
          <Dropdown content={renderUserMenu()}>
            {dropdownProps => (
              <MenuItem>
                <Avatar imgUrl={user.gravatar_url} />
                <StyledUsername {...dropdownProps}>
                  {user.full_name}
                  <CaretIcon />
                </StyledUsername>
              </MenuItem>
            )}
          </Dropdown>
        </HeaderRight>
      </Nav>
    </StyledHeader>
  )
}
