import { format } from 'date-fns'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Content, ItemBody } from '../../../components/Public/styles'
import { DateArea, ItemImage, ViewDetailsButton } from '../styles'
import { Challenge } from '../types'
import { getChallengeTimeRemaining, getTimeStatus } from '../util'

const StyledChallengeListItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 600px) {
    flex-direction: row;
    gap: 32px;
  }
`

export const Title = styled(Link)`
  color: var(--c-text-700);
  font-size: 20px;
  font-weight: bold;
  line-height: 20px;
`

export const ChallengeListItem = ({ challenge }: { challenge: Challenge }) => {
  return (
  <StyledChallengeListItem>
    <ItemImage $timeStatus={getTimeStatus(challenge.startAt, challenge.endAt)}>
      <img width="100%" src={challenge.cardImageUrl} alt="sf" />
    </ItemImage>
    <ItemBody>
      <Title to={`/challenges/${challenge.id}`}>{challenge.name}</Title>
      <DateArea>
        <span className="challenge-date-label">Starts</span>
        <span className="challenge-date">
          {format(challenge.startAt, 'MM/dd/yyyy')}
        </span>
        <span>&rarr;</span>
        <span className="challenge-date-label">Ends</span>
        <span className="challenge-date">
          {format(challenge.endAt, 'MM/dd/yyyy')}{' '}
        </span>
        <div className="challenge-date-remaining">
          {getChallengeTimeRemaining({
            startAt: challenge.startAt,
            endAt: challenge.endAt,
          })}
        </div>
      </DateArea>
      <Content>{challenge.description}</Content>
      <div>
        <ViewDetailsButton as={Link} to={`/challenges/${challenge.id}`} data-turbolinks="false">
          View Details &rarr;
        </ViewDetailsButton>
      </div>
    </ItemBody>
  </StyledChallengeListItem>
)
}