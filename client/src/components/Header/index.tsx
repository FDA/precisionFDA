import React from 'react'
import { Logo } from '../Logo'
import { Avatar } from '../Avatar'
import { PageContainer } from '../Page/styles'
import {
  HeaderItemText,
  HeaderLeft,
  MenuItem,
  HeaderRight,
  HeaderSpacer,
  Nav,
  StyledHeader,
  StyledSupport,
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
import { Link } from 'react-router-dom'

export const Header = () => {
  const renderUserMenu = () => (
    <StyledDropMenuLinks>
        <StyledLink href="/profile">Profile</StyledLink>
        <StyledLink href="/profile">Public Profile</StyledLink>
        <StyledLink href="/profile">Manage Licenses</StyledLink>
        <StyledDivider />
        <StyledLink href="/profile">About</StyledLink>
        <StyledLink href="/profile">Guidelines</StyledLink>
        <StyledLink href="/profile">Docs</StyledLink>
        <StyledDivider />
        <StyledLink href="/profile">Log out</StyledLink>
    </StyledDropMenuLinks>
  )

  return (
    <StyledHeader>
      <PageContainer>
        <Nav>
          <HeaderLeft>
            <Logo />
            <Link to="/">
              <MenuItem active={true}>
                <HomeIcon />
                <HeaderItemText>Overview</HeaderItemText>
              </MenuItem>
            </Link>
            <Link to="/discussions">
              <MenuItem>
                <CommentIcon />
                <HeaderItemText>Discussions</HeaderItemText>
              </MenuItem>
            </Link>
            <Link to="/challenges">
              <MenuItem>
                <TrophyIcon />
                <HeaderItemText>Challenges</HeaderItemText>
              </MenuItem>
            </Link>
            <Link to="/experts">
              <MenuItem>
                <StarIcon />
                <HeaderItemText>Experts</HeaderItemText>
              </MenuItem>
            </Link>
            <HeaderSpacer />
            <Link to="/notes">
              <MenuItem>
                <StickyNoteIcon />
                <HeaderItemText>Notes</HeaderItemText>
              </MenuItem>
            </Link>
            <Link to="/comparisons">
              <MenuItem>
                <BullsEyeIcon />
                <HeaderItemText>Comparisons</HeaderItemText>
              </MenuItem>
            </Link>
            <HeaderSpacer />
            <Link to="/home">
              <MenuItem>
                <FortIcon />
                <HeaderItemText>My Home</HeaderItemText>
              </MenuItem>
            </Link>
            <HeaderSpacer />
            <Link to="/spaces">
              <MenuItem>
                <ObjectGroupIcon />
                <HeaderItemText>Spaces</HeaderItemText>
              </MenuItem>
            </Link>
          </HeaderLeft>
          <HeaderRight>
            <StyledSupport>
              <CommentingIcon />
              <a
                href="mailto:precisionfda-support@dnanexus.com"
                target="_blank"
              >
                Support
              </a>
            </StyledSupport>
            <Dropdown content={renderUserMenu()}>
              {dropdownProps => (
                <StyledUsername {...dropdownProps}>
                  Username
                  <CaretIcon />
                </StyledUsername>
              )}
            </Dropdown>
            <Avatar />
          </HeaderRight>
        </Nav>
      </PageContainer>
    </StyledHeader>
  )
}
