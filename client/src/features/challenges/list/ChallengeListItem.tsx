import { format } from 'date-fns'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Content, ItemBody, Title } from '../../../components/Public/styles'
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

export const ChallengeListItem = ({ challenge }: { challenge: Challenge }) => (
  <StyledChallengeListItem>
    <ItemImage $timeStatus={getTimeStatus(challenge.start_at, challenge.end_at)}>
      <img width="100%" src={challenge.card_image_url} alt="sf" />
    </ItemImage>
    <ItemBody>
      <Title>{challenge.name}</Title>
      <DateArea>
        <span className="challenge-date-label">Starts</span>
        <span className="challenge-date">
          {format(challenge.start_at, 'MM/dd/yyyy')}
        </span>
        <span>&rarr;</span>
        <span className="challenge-date-label">Ends</span>
        <span className="challenge-date">
          {format(challenge.end_at, 'MM/dd/yyyy')}{' '}
        </span>
        <div className="challenge-date-remaining">
          {getChallengeTimeRemaining({
            start_at: challenge.start_at,
            end_at: challenge.end_at,
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
