import { useQuery } from 'react-query'
import { toast } from 'react-toastify'
import { challengesRequest } from '../api'
import { ChallengeListParams } from '../types'


export const useChallengesListQuery = (params: ChallengeListParams) => useQuery(
  ['news', params.year, params.time_status, params.pagination.pageParam, params.pagination.perPageParam],
  () => challengesRequest(params),
  {
    onError: (err: any) => {
      if (err && err.message) toast.error(err.message)
    },
  })
