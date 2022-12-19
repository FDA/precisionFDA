import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Loader } from '../../components/Loader'
import { SectionTitle } from '../../components/Public/styles'
import { ChallengeListItem } from '../challenges/list/ChallengeListItem'
import { useChallengesListQuery } from '../challenges/list/useChallengesListQuery'
import { getTimeStatusColor } from '../challenges/util'
import { ViewAllButton } from './styles'

const StyledChallengesOverview = styled.div`
  margin-bottom: 64px;
`

const StyledSectionTitle = styled(SectionTitle)<{ tscolor?: string }>`
  border-top: 3px solid ${({ tscolor }) => tscolor};
  padding-top: 8px;
`

const StyledChallengeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-bottom: 32px;
`

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  ${StyledSectionTitle} {
    width: auto;
  }

  @media (min-width: 750px) {
    flex-direction: row;
    gap: 32px;
    ${StyledSectionTitle} {
      width: 96px;
    }
  }
`

const Filler = styled.div`
  width: 96px;
`

const NoChallenges = styled.div`
  margin-bottom: 32px;
`

export default function ChallengesOverviewList() {
  const { data: current, isLoading: currentIsLoading } = useChallengesListQuery(
    {
      time_status: 'current',
    },
  )
  const { data: upcoming, isLoading: upcomingIsLoading } =
    useChallengesListQuery({
      time_status: 'upcoming',
    })
  const { data: ended, isLoading: endedIsLoading } = useChallengesListQuery({
    time_status: 'ended',
  })

  return (
    <StyledChallengesOverview>
      {(currentIsLoading || upcomingIsLoading || endedIsLoading) && <Loader displayInline />}
      {!currentIsLoading &&
        current?.challenges &&
        current.challenges.length > 0 && (
          <Row>
            <StyledSectionTitle tscolor={getTimeStatusColor('current')}>
              Current Challenges
            </StyledSectionTitle>
            <StyledChallengeList>
              {current?.challenges?.slice(0, 2).map(c => (
                <ChallengeListItem key={c.id} challenge={c} />
              ))}
            </StyledChallengeList>
          </Row>
        )}

      {!upcomingIsLoading &&
        upcoming?.challenges &&
        upcoming.challenges.length > 0 && (
          <Row>
            <StyledSectionTitle tscolor={getTimeStatusColor('upcoming')}>
              Upcoming Challenges
            </StyledSectionTitle>
            <StyledChallengeList>
              {upcoming?.challenges?.slice(0, 2).map(c => (
                <ChallengeListItem key={c.id} challenge={c} />
              ))}
            </StyledChallengeList>
          </Row>
        )}

      {!endedIsLoading &&
        ended?.challenges &&
        ended.challenges.length > 0 &&
        current?.challenges.length === 0 &&
        upcoming?.challenges.length === 0 && (
          <Row>
            <StyledSectionTitle tscolor={getTimeStatusColor('ended')}>
              Ended Challenges
            </StyledSectionTitle>
            <StyledChallengeList>
              {ended?.challenges?.slice(0, 2).map(c => (
                <ChallengeListItem key={c.id} challenge={c} />
              ))}
            </StyledChallengeList>
          </Row>
        )}
      {!currentIsLoading &&
        !upcomingIsLoading &&
        !endedIsLoading &&
        ended?.challenges.length === 0 &&
        current?.challenges.length === 0 &&
        upcoming?.challenges.length === 0 && (
          <Row>
            <Filler />
            <NoChallenges>Currently no challenges</NoChallenges>
          </Row>
        )}
      <Row>
        <Filler />
        <ViewAllButton>
          <Link to="/challenges">View All Challenges</Link>
        </ViewAllButton>
      </Row>
    </StyledChallengesOverview>
  )
}
