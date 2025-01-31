import React from 'react'
import { Link, Route, Routes, useMatch, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { TransparentButton } from '../../../components/Button'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { useAuthUser } from '../../auth/useAuthUser'
import { canEditContent } from '../../data-portals/utils'
import { ContentTypePage } from './ContentTypePage'


const StyledChallengeHeader = styled.div`
  max-width: 300px;
  min-width: 226px;
  flex: 1 1 auto;
  border-right: 1px solid #e0e0e0;
`
const StyledRow = styled.div`
  display: flex;
  flex-grow: 1;
  height: 0;
`
const NavItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid #e0e0e0;
  width: auto;
  font-size: 14px;
  
  &[data-active='true'] {
    background-color: antiquewhite;
  }
  
  a {
    flex-grow: 1;
    padding: 12px 0;
  }
`

const StyledTitle = styled.h1`
  font-size: 24px;
  font-weight: 500;
  padding: 0 24px;
  margin-top: 20px;
`
const StyledNavButton = styled(TransparentButton)`
  flex: 1;
  height: max-content;
  height: 40px;
  padding: 12px 8px;
`
const NavItemResource = styled(NavItem)`
  border-top: 1px solid #e0e0e0;
`
const NavItemBack = styled(NavItem)`
  /* margin: 16px 0; */
  font-size: 14px;
  height: 60px;
  padding-bottom: 24px;
`

export default function ChallengeContentEditPage(): JSX.Element {
  const user = useAuthUser()
  const { challengeId } = useParams<{
    challengeId: string
  }>()

  if (canEditContent(user?.isAdmin)) {
    return <NotAllowedPage />
  }

  return (
    <StyledRow>
      <StyledChallengeHeader>
        <StyledTitle>Content Editor</StyledTitle>
        <NavItemBack>
          <Link to={`/challenges/${challengeId}`}>Back to Challenge</Link>
        </NavItemBack>
        <NavItem data-active={!!useMatch('/challenges/:challengeId/content/info')}>
          <Link to={`/challenges/${challengeId}/content/info`}>Challenge Info</Link>
        </NavItem>
        <NavItem data-active={!!useMatch('/challenges/:challengeId/content/results')}>
          <Link to={`/challenges/${challengeId}/content/results`}>Challenge Results</Link>
        </NavItem>
        <NavItem data-active={!!useMatch('/challenges/:challengeId/content/pre-registration')}>
          <Link to={`/challenges/${challengeId}/content/pre-registration`}>Pre-Registration</Link>
        </NavItem>
        <br />
        <NavItemResource>
          <a data-turbolinks="false" href={`/challenges/${challengeId}/editor/resources`}>Resources</a>
        </NavItemResource>
      </StyledChallengeHeader>
      <Routes>
        <Route path="/info" element={<ContentTypePage key="info" challengeId={challengeId} contentType="info" />} />
        <Route path="/results" element={<ContentTypePage key="results" challengeId={challengeId} contentType="results" />} />
        <Route path="/pre-registration" element={<ContentTypePage key="pre-registration" challengeId={challengeId} contentType="pre-registration" />} />
      </Routes>
    </StyledRow>
  )
}
