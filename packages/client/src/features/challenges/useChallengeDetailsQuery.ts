import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { challengeByID, challengeDetailsRequest, ContentType } from './api'
import { Challenge, ChallengeOld } from './types'
import { ApiErrorResponse } from '../home/types'
import { toastError } from '../../components/NotificationCenter/ToastHelper'

export const useChallengeDetailsQuery = (id: string) =>
  useQuery<ChallengeOld, AxiosError<ApiErrorResponse>>({
    queryKey: ['challenge-custom', id],
    queryFn: () =>
      challengeDetailsRequest(id, true).catch(err => {
        if (err && err.message) toastError(err.message)
        throw err
      }),
  })
export const useChallengeByIDQuery = (id: number | string, contentType?: ContentType) =>
  useQuery<Challenge, AxiosError<ApiErrorResponse>>({
    retry: false,
    queryKey: ['challenge', id, contentType],
    queryFn: () =>
      challengeByID(id).catch(err => {
        throw err
      }),
  })
