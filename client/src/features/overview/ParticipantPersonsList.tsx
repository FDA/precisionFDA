import React from 'react'
import styled from 'styled-components'
import { Loader } from '../../components/Loader'
import { useParticipantsQuery } from './useParticipantsQuery'

const StyledParticipantPersonsList = styled.ul`
  list-style-type: none;
  display: flex;
  flex: row nowrap;
  justify-content: space-around;
  overflow-x: auto;
  gap: 16px;

  li {
    display: inline-block;
    font-size: 10px;
    color: #333;
    text-align: center;
    width: 100px;
  }

  img {
    width: 64px;
    height: 64px;
    object-fit: contain;
    margin: 4px auto;
    border-radius: 50%;
  }
`

export const ParticipantPersonsList = () => {
  const { isLoading, data } = useParticipantsQuery()

  if (isLoading) return <Loader />

  const persons = data?.persons || []
  return (
    <StyledParticipantPersonsList>
      {persons.map(participant => (
        <li
          title={participant.title}
          data-toggle="tooltip"
          key={participant.id}
        >
          <img
            src={participant.image_url}
            alt={participant.title}
          />
          <div>{participant.title}</div>
        </li>
      ))}
    </StyledParticipantPersonsList>
  )
}
