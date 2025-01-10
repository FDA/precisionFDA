import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { Submission } from './submission.types'

export async function challengeEntriesListRequest(challengeId: string) {
  return axios.get(`/api/v2/challenges/${challengeId}/entries`).then(r => r.data as Submission[])
}

export const useChallengeEntriesQuery = (challengeId: string) => {
  return useQuery({
    queryKey: ['challenge-entries', challengeId],
    queryFn: () => challengeEntriesListRequest(challengeId),
  })
}
