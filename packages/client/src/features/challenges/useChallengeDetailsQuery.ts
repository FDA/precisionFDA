import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'
import { challengeByID, challengeDetailsRequest, ContentType } from './api'
import { Challenge } from './types'

export const useChallengeDetailsQuery = (id: string) =>
  useQuery({
    queryKey: ['challenge-custom', id],
    queryFn: () => challengeDetailsRequest(id, true).catch((err) => {
      if (err && err.message) toast.error(err.message)
    }),
  })
export const useChallengeByIDQuery = (id: number, contentType?: ContentType) =>
  useQuery<Challenge, AxiosError>({
    retry: false,
    queryKey: ['challenge', id, contentType],
    queryFn: () => challengeByID(id).catch((err) => {
      throw err
    }),
  })

