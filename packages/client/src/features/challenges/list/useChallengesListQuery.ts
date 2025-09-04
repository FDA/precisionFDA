import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { challengesRequest } from '../api'
import { ChallengeListParams } from '../types'

export const useChallengesListQuery = (params: ChallengeListParams) => useQuery({
  queryKey: ['challengesList', params.year, params.timeStatus, params?.page, params.pageSize],
  queryFn: () => challengesRequest(params).catch(err => {
    if (err && err.message) toast.error(err.message)
    return []
  }),
})