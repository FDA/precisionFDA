import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { Submission } from './submission.types'

export interface ChallengeSubmissionListResponse {
  submissions: Submission[];
}

export async function challengeEntriesListRequest(challengeId: string) {
  return axios.get(`/api/submissions/my_entries?challenge_id=${challengeId}`).then(r => r.data as ChallengeSubmissionListResponse)
}

export const useChallengeEntriesQuery = (challengeId: string) => {
  return useQuery(['challenge-entries', challengeId], {
    queryFn: () => challengeEntriesListRequest(challengeId),
  })
}
