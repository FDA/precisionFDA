import React, { FunctionComponent } from 'react'

import './style.sass'
import { queryParticipants } from '../../../../api/participants'


const ParticipantPersonsList: FunctionComponent = () => {
  const { status, error, data } = queryParticipants()

  if (error) {
    return (
      <div>{error.message}</div>
    )
  }

  if (status == 'loading' || !data || !data.persons) {
    return (
      <></>
    )
  }

  const persons = data.persons
  return (
    <ul className="participant-persons-list">
      {persons.map((participant) => (
        <li className="person-participant" title={participant.title} data-toggle="tooltip" key={participant.id}>
          <img src={participant.imageURL} className="img-circle" alt={participant.title}/>
          <div>{participant.title}</div>
        </li>
      ))}
    </ul>
  )
}

export {
  ParticipantPersonsList
}

export default ParticipantPersonsList
