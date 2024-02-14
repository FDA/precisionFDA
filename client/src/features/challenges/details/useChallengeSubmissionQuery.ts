import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { Submission } from './submission.types'

export interface ChallengeSubmissionListResponse {
  submissions: Submission[];
}

export async function challengeSubmissionListRequest(challengeId: string) {
  return axios.get(`/api/submissions?challenge_id=${challengeId}`).then(r => r.data as ChallengeSubmissionListResponse)
}

export const useChallengeSubmissionQuery = (challengeId: string) => {
  return useQuery({
    queryKey: ['challenge-submission', challengeId],
    queryFn: () => challengeSubmissionListRequest(challengeId),
  })
}
