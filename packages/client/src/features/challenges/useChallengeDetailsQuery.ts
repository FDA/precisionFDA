import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { toastError } from '@/components/NotificationCenter/ToastHelper'
import type { ApiErrorResponse } from '../home/types'
import { challengeByID, challengeDetailsRequest } from './api'
import type { Challenge, ChallengeOld } from './types'

export const useChallengeDetailsQuery = (id: string) =>
  useQuery<ChallengeOld, AxiosError<ApiErrorResponse>>({
    queryKey: ['challenge-custom', id],
    queryFn: () =>
      challengeDetailsRequest(id, true).catch(err => {
        if (err?.message) toastError(err.message)
        throw err
      }),
  })
export const useChallengeByIDQuery = (id: number | string) =>
  useQuery<Challenge, AxiosError<ApiErrorResponse>>({
    retry: false,
    queryKey: ['challenge', id],
    queryFn: () =>
      challengeByID(id).catch(err => {
        throw err
      }),
  })
