import axios from 'axios'
import { useQuery } from 'react-query'
import { ParticipantsResponse } from './types'

export async function getParticipantsQuery() {
  return axios.get('/api/participants/').then(r => r.data as ParticipantsResponse)
}

export const useParticipantsQuery = () => {
  return useQuery('participants', getParticipantsQuery)
}
