import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { ParticipantsResponse } from './types'

export async function getParticipantsQuery() {
  return axios.get('/api/participants/').then(r => r.data as ParticipantsResponse)
}

export const useParticipantsQuery = () => {
  return useQuery({
    queryKey: ['participants'],
    queryFn: getParticipantsQuery,
  })
}
