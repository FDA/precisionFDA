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
  AvatarMenuItem,
  IconWrap,
  StyledRightMenu,
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
import { IUser } from '../../types/user'
import { useQuery } from 'react-query'
import { fetchCurrentUser } from '../../features/auth/api'

interface IHeader {}

export const Header: React.FC<IHeader> = () => {
  const pathname = useLocation().pathname
  const { data: user, status } = useQuery('currentUser', fetchCurrentUser)

  if (status === 'loading') return null

  const userCanAdministerSite = user!.can_administer_site
  const userCanSeeSpaces = user!.can_see_spaces

  const renderUserMenu = () => (
    <StyledDropMenuLinks>
      <StyledLink href="/profile">Profile</StyledLink>
      <StyledLink href={`/users/${user!.dxuser}`}>Public Profile</StyledLink>
      <StyledLink href="/licenses">Manage Licenses</StyledLink>
      <StyledLink href="/account/notifications">
        Notification Settings
      </StyledLink>
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

  const isActiveLink = (linkPath: string) => {
    if (linkPath == '/') {
      // Special case
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
              <IconWrap>
                <HomeIcon />
              </IconWrap>
              <HeaderItemText>Overview</HeaderItemText>
            </MenuItem>
          </Link>
          <Link to="/discussions" title="Discussions">
            <MenuItem active={isActiveLink('/discussions')}>
              <IconWrap>
                <CommentIcon />
              </IconWrap>
              <HeaderItemText>Discussions</HeaderItemText>
            </MenuItem>
          </Link>
          <Link to="/challenges" title="Challenges">
            <MenuItem active={isActiveLink('/challenges')}>
              <IconWrap>
                <TrophyIcon />
              </IconWrap>
              <HeaderItemText>Challenges</HeaderItemText>
            </MenuItem>
          </Link>
          <Link to="/experts" title="Exoerts">
            <MenuItem active={isActiveLink('/experts')}>
              <IconWrap>
                <StarIcon />
              </IconWrap>
              <HeaderItemText>Experts</HeaderItemText>
            </MenuItem>
          </Link>
          <HeaderSpacer />
          <Link to="/home" title="My Home">
            <MenuItem active={isActiveLink('/home')}>
              <IconWrap>
                <FortIcon />
              </IconWrap>
              <HeaderItemText>My Home</HeaderItemText>
            </MenuItem>
          </Link>
          <HeaderSpacer />
          <Link to="/notes" title="Notes">
            <MenuItem active={isActiveLink('/notes')}>
              <IconWrap>
                <StickyNoteIcon />
              </IconWrap>
              <HeaderItemText>Notes</HeaderItemText>
            </MenuItem>
          </Link>
          <Link to="/comparisons" title="Comparisons">
            <MenuItem active={isActiveLink('/comparisons')}>
              <IconWrap>
                <BullsEyeIcon />
              </IconWrap>
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
            <StyledRightMenu>
              <CommentingIcon width={14} />
              <HeaderItemText>Support</HeaderItemText>
            </StyledRightMenu>
          </a>
          <a href="/docs" title="Get Started">
            <StyledRightMenu active={isActiveLink('/docs')}>
              <HeaderItemText>Get Started</HeaderItemText>
            </StyledRightMenu>
          </a>
          <Dropdown trigger="click" content={renderUserMenu()}>
            {dropdownProps => (
              <AvatarMenuItem {...dropdownProps}>
                <Avatar imgUrl={user!.gravatar_url} />
                <StyledUsername>
                  {user!.full_name}
                  <CaretIcon />
                </StyledUsername>
              </AvatarMenuItem>
            )}
          </Dropdown>
        </HeaderRight>
      </Nav>
    </StyledHeader>
  )
}
