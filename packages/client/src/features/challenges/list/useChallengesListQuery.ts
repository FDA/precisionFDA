import { useQuery } from '@tanstack/react-query'
import { challengesRequest } from '../api'
import { ChallengeListParams } from '../types'
import { toastError } from '../../../components/NotificationCenter/ToastHelper'

export const useChallengesListQuery = (params: ChallengeListParams) =>
  useQuery({
    queryKey: ['challengesList', params.year, params.timeStatus, params?.page, params.pageSize],
    queryFn: () =>
      challengesRequest(params).catch(err => {
        if (err && err.message) toastError(err.message)
        return []
      }),
  })
