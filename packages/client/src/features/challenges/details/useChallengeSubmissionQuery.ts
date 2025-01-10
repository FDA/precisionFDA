import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { SubmissionV2 } from './submission.types'

export async function challengeSubmissionListRequest(challengeId: number) {
  return axios.get(`/api/v2/challenges/${challengeId}/submissions`).then(r => r.data as SubmissionV2[])
}

export const useChallengeSubmissionQuery = (challengeId: number) => {
  return useQuery({
    queryKey: ['challenge-submission', challengeId],
    queryFn: () => challengeSubmissionListRequest(challengeId),
  })
}
