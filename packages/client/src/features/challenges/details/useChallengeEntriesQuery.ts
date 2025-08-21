import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { SubmissionV2 } from './submission.types'

export async function challengeEntriesListRequest(challengeId: string|number) {
  return axios.get(`/api/v2/challenges/${challengeId}/entries`).then(r => r.data as SubmissionV2[])
}

export const useChallengeEntriesQuery = (challengeId: string|number) => {
  return useQuery({
    queryKey: ['challenge-entries', challengeId],
    queryFn: () => challengeEntriesListRequest(challengeId),
  })
}
