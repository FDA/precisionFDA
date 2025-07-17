import React from 'react'
import styled from 'styled-components'
import { Loader } from '../../components/Loader'
import { useParticipantsQuery } from './useParticipantsQuery'
import { compactScrollBar } from '../../components/Page/styles'

const StyledParticipantsList = styled.ul`
  ${compactScrollBar}
  display: grid;
  grid-template-rows: 72px 72px;
  grid-auto-flow: column;
  grid-auto-columns: 160px;
  grid-gap: 5px;
  overflow-x: auto;
  list-style-type: none;


  li {
    display: inline-block;
    &:nth-child(2n + 1) {
      transform: translateX(50%);
    }
  }

  img {
    object-fit: contain;
    width: 128px;
    height: 60px;

    filter: grayscale(1);
    transition: filter 0.2s ease;
    
    &:hover {
      filter: none;
    }
  }

  [data-theme="dark"] & img {
    filter: grayscale(1) invert(1);
    transition: filter 0.2s ease;
    
    &:hover {
      filter: none;
    }
  }
`

export const ParticipantOrgsList = () => {
  const { isLoading, data } = useParticipantsQuery()

  if (isLoading) return <Loader />

  const orgs = data?.orgs || []
  return (
    <StyledParticipantsList>
      {orgs.map(participant => (
        <li
          title={participant.title}
          data-toggle="tooltip"
          key={participant.id}
        >
          <img src={participant.image_url} alt={participant.title} />
        </li>
      ))}
    </StyledParticipantsList>
  )
}
