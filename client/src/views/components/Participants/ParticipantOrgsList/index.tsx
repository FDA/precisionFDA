import React, { FunctionComponent } from 'react'

import './style.sass'
import { IParticipant } from '../../../../types/participant'
import { queryParticipants } from '../../../../api/participants'


const ParticipantOrgsList: FunctionComponent = () => {
  const { status, error, data } = queryParticipants()

  if (error) {
    return (
      <div>{error.message}</div>
    )
  }

  if (status == 'loading' || !data || !data.orgs) {
    return (
      <></>
    )
  }

  const orgs = data.orgs
  return (
    <ul className="participant-orgs-list">
      {orgs.map((participant: IParticipant) => (
        <li title={participant.title} data-toggle="tooltip" key={participant.id}>
          <img src={participant.imageURL} alt={participant.title}/>
        </li>
      ))}
    </ul>
  )
}

export {
  ParticipantOrgsList
}

export default ParticipantOrgsList
