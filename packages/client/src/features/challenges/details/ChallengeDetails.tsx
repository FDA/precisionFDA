/* eslint-disable no-nested-ternary */
import React, { useEffect, useRef, useState } from 'react'
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Loader } from '../../../components/Loader'
import { AddIdsToHeaders } from '../../../components/Markdown/AddIdsToHeaders'
import { PageContainer, PageContainerMargin } from '../../../components/Page/styles'
import { usePageMeta } from '../../../hooks/usePageMeta'
import { cleanObject } from '../../../utils/object'
import { useAuthUser } from '../../auth/useAuthUser'
import { IToCItem, setTocFromRef, ToC } from '../../markdown/TocNext'
import { useChallengeByIDQuery } from '../useChallengeDetailsQuery'
import { ChallengeDetailsBanner } from './ChallengeDetailsBanner'
import { NoInfo } from './styles'
import { ChallengeSubmissionsTable } from './ChallengeSubmissionsTable'
import { ChallengeMyEntriesTable } from './ChallengeMyEntriesTable'
import { useNumberParams } from '../../../utils/useNumberParams'
import { MDStyles } from '../../../components/Markdown/styles'

const StyledChallengeNavigation = styled.div`
  background-color: var(--tertiary-30);
  list-style: none;
  border-bottom: 1px solid var(--c-layout-border-200);
  position: sticky;
  top: 0;
  z-index: 1;
`
const ChallengeRightSide = styled.div`
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: unset;
  top: 76px;
  height: min-content;
`
export const ChallengePageRow = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column-reverse;
  gap: 64px;
  padding: 44px 0;
  order: -1;
  @media (min-width: 960px) {
    flex-direction: row;
    justify-content: space-between;
    ${ChallengeRightSide} {
      position: sticky;
      flex: 0 1 auto;
      min-width: 256px;
      max-width: 256px;
    }
  }
`

const NavigationInner = styled(PageContainer)`
  display: flex;
  padding: 0 32px;
  flex-direction: row;
  gap: 4px;
`
const ItemLink = styled(Link)``
const StyledChallengeNavigationItem = styled.div`
  padding: 16px 0;
  border-bottom: 3px solid transparent;
  font-weight: bold;
  color: var(--c-text-400);
  margin-bottom: -1px;

  &[data-active='true'] {
    border-color: var(--c-tabs-selected);
    color: var(--c-text-500);
  }

  ${ItemLink} {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2px;
    all: unset;
    padding: 8px 12px;
    outline: none;
    -webkit-user-select: none;
    user-select: none;
    line-height: 1;
    border-radius: 4px;
    font-size: 15px;

    &:hover {
      background-color: var(--tertiary-70);
      cursor: pointer;
    }
  }
`

const StyledInnerHTMLChallenge = styled.div`
  line-height: 1.7;
`

export const ChallengeDetails = () => {
  usePageMeta({ title: 'Challenge - precisionFDA' })

  const { challengeId } = useNumberParams()

  const user = useAuthUser()
  const { data: challenge, isLoading, error } = useChallengeByIDQuery(challengeId!)
  const isLoggedIn = !!user?.id
  const canCreate = user?.is_guest

  const isOld = undefined

  const wildcard = useParams()['*'] as 'intro' | 'results' | 'submissions' | 'pre-registration' | 'my-entries'
  usePageMeta({ title: `${challenge?.name} - precisionFDA Challenge` })
  const docRef = useRef(null)
  const [toc, setToc] = useState<IToCItem[]>([])
  useEffect(() => {
    setTocFromRef(docRef, setToc)
  }, [docRef, wildcard])

  if (isLoading) {
    return (
      <PageContainerMargin>
        <Loader />
      </PageContainerMargin>
    )
  }

  if (error?.status === 404) {
    return (
      <PageContainerMargin>
        404 Not Found
      </PageContainerMargin>
    )
  }

  if (!challenge) {
    return (
      <PageContainerMargin>
        Something is not working...
      </PageContainerMargin>
    )
  }

  const challengePreRegistration = challenge.status === 'pre-registration'
  const challengeSetupOrPreRegistration = challenge.status === 'setup' || challengePreRegistration

  const userIsChallengeAdmin = isLoggedIn && canCreate

  const userCanSeePreRegistration =
    (challengePreRegistration || (userIsChallengeAdmin && challengeSetupOrPreRegistration)) && !isOld

  // Introduction is visible to:
  //  - everyone when a challenge is not in pre-registration phase
  //  - challenge admins in all phases of a challenge
  const userCanSeeIntroduction = !challengePreRegistration || userIsChallengeAdmin

  // Submissions are visible to:
  //  - any logged in users when challenge is not in setup or pre-registration phase
  const userCanSeeSubmissions = isLoggedIn && !challengeSetupOrPreRegistration

  // Results are visible to:
  //  - challenge admins
  //  - everyone when results are announced or challenge is archived
  const userCanSeeResults = userIsChallengeAdmin || challenge.status === 'result_announced' || challenge.status === 'archived'


  let regions = {}
  if(challenge?.meta) {
    const meta = JSON.parse(challenge?.meta)
    regions = {
      intro: meta.regions?.intro ?? challenge.infoContent,
      results: meta.regions?.intro ?? challenge.resultsContent,
      preReg: meta.regions?.intro ?? challenge.preRegistrationContent,
    }
  } else {
    regions = {
      intro: challenge?.infoContent,
      results: challenge?.resultsContent,
      preReg: challenge?.preRegistrationContent,
    }
  }

  const isNoInfoProvided =
    Object.keys(
      cleanObject(regions),
    ).length === 0

  return (
    <>
      <ChallengeDetailsBanner challenge={challenge} user={user} />

      <StyledChallengeNavigation>
        <NavigationInner>
          {userCanSeeIntroduction && (
            <StyledChallengeNavigationItem data-active={wildcard === 'intro'}>
              <ItemLink as={Link} to={`/challenges/${challenge.id}/intro`}>
                Introduction
              </ItemLink>
            </StyledChallengeNavigationItem>
          )}
          {userCanSeeResults && (
            <StyledChallengeNavigationItem data-active={wildcard === 'results'}>
              <ItemLink as={Link} to={`/challenges/${challenge.id}/results`}>
                Results
              </ItemLink>
            </StyledChallengeNavigationItem>
          )}
          {userCanSeeSubmissions && (
            <>
              <StyledChallengeNavigationItem data-active={wildcard === 'submissions'}>
                <ItemLink as={Link} to={`/challenges/${challenge.id}/submissions`}>
                  Submissions
                </ItemLink>
              </StyledChallengeNavigationItem>
              <StyledChallengeNavigationItem data-active={wildcard === 'my-entries'}>
                <ItemLink as={Link} to={`/challenges/${challenge.id}/my-entries`}>
                  My Entries
                </ItemLink>
              </StyledChallengeNavigationItem>
            </>
          )}
          {userCanSeePreRegistration && (
            <StyledChallengeNavigationItem data-active={wildcard === 'pre-registration'}>
              <ItemLink as={Link} to={`/challenges/${challenge.id}/pre-registration`}>
                Pre-Registration
              </ItemLink>
            </StyledChallengeNavigationItem>
          )}
        </NavigationInner>
      </StyledChallengeNavigation>
      <PageContainerMargin>
        <ChallengePageRow>
          <Routes>
            <Route
              path="submissions"
              element={
                <ChallengeSubmissionsTable
                  user={user}
                  challengeId={challenge.id}
                  isSpaceMember={challenge.isSpaceMember}
                />
              }
            />
            <Route
              path="my-entries"
              element={isLoggedIn &&
                <ChallengeMyEntriesTable
                  user={user}
                  challengeId={challenge.id}
                  isSpaceMember={challenge.isSpaceMember}
                />
              }
            />
            <Route
              path="intro"
              element={
                <MDStyles>
                  <AddIdsToHeaders docRef={docRef} content={regions.intro} />
                </MDStyles>
              }
            />
            <Route
              path="results"
              element={
                <MDStyles>
                  <AddIdsToHeaders docRef={docRef} content={regions.results} />
                </MDStyles>
              }
            />
            <Route
              path="pre-registration"
              element={
                <MDStyles>
                  <AddIdsToHeaders docRef={docRef} content={regions.preReg} />
                </MDStyles>
              }
            />
            <Route path="/" element={<Navigate to={challengePreRegistration ? 'pre-registration' : 'intro'} replace />} />
          </Routes>
          {!isOld && <ChallengeRightSide>{toc && toc.length > 0 && <ToC items={toc} />}</ChallengeRightSide>}
        </ChallengePageRow>
        <div>{isNoInfoProvided && <NoInfo>No information about this challenge has been provided yet.</NoInfo>}</div>
      </PageContainerMargin>
    </>
  )
}
