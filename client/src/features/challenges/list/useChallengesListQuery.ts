import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { challengesRequest } from '../api'
import { ChallengeListParams } from '../types'


export const useChallengesListQuery = (params: ChallengeListParams) => useQuery(
  ['challengesList', params.year, params.time_status, params?.page, params.perPage],
  () => challengesRequest(params),
  {
    onError: (err: any) => {
      if (err && err.message) toast.error(err.message)
    },
  })
