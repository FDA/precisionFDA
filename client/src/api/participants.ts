import { useQuery } from "react-query"
import { IParticipant, mapToParticipant } from '../types/participant'

interface IParticipantsPayload {
  persons: IParticipant[],
  orgs: IParticipant[],
}

async function getParticipantsQuery() {
  const response = await fetch(`/api/participants/`)
  if (!response.ok) {
    throw new Error("Error fetching participants data")
  }
  const payload = await response.json()
  return {
    orgs: payload.orgs.map(mapToParticipant),
    persons: payload.persons.map(mapToParticipant),
  }
}

const queryParticipants = () => {
  return useQuery<IParticipantsPayload, Error>('participants', getParticipantsQuery)
}

export {
  queryParticipants,
}
