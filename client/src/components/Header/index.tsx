import React from 'react'
import { Logo } from '../Logo'
import { Avatar } from '../Avatar'
import { PageContainer } from '../Page/styles'
import { HeaderIcon, HeaderLeft, HeaderRight, HeaderSpacer, Nav, StyledHeader } from './styles'

export const Header = () => {
  return (
    <StyledHeader>
      <PageContainer>
        <Nav>
          <HeaderLeft>
            <Logo />
            <HeaderIcon>Overview</HeaderIcon>
            <HeaderIcon>Discussions</HeaderIcon>
            <HeaderIcon>Challenges</HeaderIcon>
            <HeaderIcon>Experts</HeaderIcon>
            <HeaderSpacer />
            <HeaderIcon>Notes</HeaderIcon>
            <HeaderIcon>Comparisons</HeaderIcon>
            <HeaderSpacer />
            <HeaderIcon>My Home</HeaderIcon>
            <HeaderSpacer />
            <HeaderIcon>Spaces</HeaderIcon>
          </HeaderLeft>
          <HeaderRight>
            <div>
              <a href="mailto:precisionfda-support@dnanexus.com" target="_blank">Support</a>
            </div>
            <div>
              Username
            </div>
            <Avatar />
          </HeaderRight>
        </Nav>
      </PageContainer>
    </StyledHeader>
  )
}