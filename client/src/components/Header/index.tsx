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
  StyledLinkWrapper,
  StyledLink,
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

export const Header = () => {
  const renderUserMenu = () => (
    <StyledDropMenuLinks>
      <StyledLinkWrapper><StyledLink href="/profile">Profile</StyledLink></StyledLinkWrapper>
      <StyledLinkWrapper><StyledLink href="/profile">Public Profile</StyledLink></StyledLinkWrapper>
      <StyledLinkWrapper><StyledLink href="/profile">Manage Licenses</StyledLink></StyledLinkWrapper>
      <StyledLinkWrapper><StyledLink href="/profile">About</StyledLink></StyledLinkWrapper>
      <StyledLinkWrapper><StyledLink href="/profile">Guidelines</StyledLink></StyledLinkWrapper>
      <StyledLinkWrapper><StyledLink href="/profile">Docs</StyledLink></StyledLinkWrapper>
      <StyledLinkWrapper><StyledLink href="/profile">Log out</StyledLink></StyledLinkWrapper>
    </StyledDropMenuLinks>
  )

  return (
    <StyledHeader>
      <PageContainer>
        <Nav>
          <HeaderLeft>
            <Logo />
            <MenuItem active={true}>
              <HomeIcon />
              <HeaderItemText>Overview</HeaderItemText>
            </MenuItem>
            <MenuItem>
              <CommentIcon />
              <HeaderItemText>Discussions</HeaderItemText>
            </MenuItem>
            <MenuItem>
              <TrophyIcon />
              <HeaderItemText>Challenges</HeaderItemText>
            </MenuItem>
            <MenuItem>
              <StarIcon />
              <HeaderItemText>Experts</HeaderItemText>
            </MenuItem>
            <HeaderSpacer />
            <MenuItem>
              <StickyNoteIcon />
              <HeaderItemText>Notes</HeaderItemText>
            </MenuItem>
            <MenuItem>
              <BullsEyeIcon />
              <HeaderItemText>Comparisons</HeaderItemText>
            </MenuItem>
            <HeaderSpacer />
            <MenuItem>
              <FortIcon />
              <HeaderItemText>My Home</HeaderItemText>
            </MenuItem>
            <HeaderSpacer />
            <MenuItem>
              <ObjectGroupIcon />
              <HeaderItemText>Spaces</HeaderItemText>
            </MenuItem>
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
