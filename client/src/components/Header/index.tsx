import React from 'react'
import { Logo } from '../Logo'
import { Avatar } from '../Avatar'
import { PageContainer } from '../Page/styles'
import { HeaderItem, HeaderItemText, HeaderLeft, HeaderRight, HeaderSpacer, Nav, StyledHeader, StyledSupport, StyledUsername } from './styles'
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

export const Header = () => {
  return (
    <StyledHeader>
      <PageContainer>
        <Nav>
          <HeaderLeft>
            <Logo />
            <HeaderItem active={true}>
              <HomeIcon />
              <HeaderItemText>Overview</HeaderItemText>
            </HeaderItem>
            <HeaderItem>
              <CommentIcon />
               <HeaderItemText>Discussions</HeaderItemText>
            </HeaderItem>
            <HeaderItem>
              <TrophyIcon />
               <HeaderItemText>Challenges</HeaderItemText>
            </HeaderItem>
            <HeaderItem>
              <StarIcon />
               <HeaderItemText>Experts</HeaderItemText>
            </HeaderItem>
            <HeaderSpacer />
            <HeaderItem>
              <StickyNoteIcon />
               <HeaderItemText>Notes</HeaderItemText>
            </HeaderItem>
            <HeaderItem>
              <BullsEyeIcon />
               <HeaderItemText>Comparisons</HeaderItemText>
            </HeaderItem>
            <HeaderSpacer />
            <HeaderItem>
              <FortIcon />
               <HeaderItemText>My Home</HeaderItemText>
            </HeaderItem>
            <HeaderSpacer />
            <HeaderItem>
              <ObjectGroupIcon />
               <HeaderItemText>Spaces</HeaderItemText>
            </HeaderItem>
          </HeaderLeft>
          <HeaderRight>
            <StyledSupport>
              <CommentingIcon />
              <a href="mailto:precisionfda-support@dnanexus.com" target="_blank">Support</a>
            </StyledSupport>
            <StyledUsername>
              Username
              <CaretIcon />
            </StyledUsername>
            <Avatar />
          </HeaderRight>
        </Nav>
      </PageContainer>
    </StyledHeader>
  )
}
