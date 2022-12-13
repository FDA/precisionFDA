import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { challengeDetailsRequest } from './api'

export const useChallengeDetailsQuery = (id: string, custom?: boolean) =>
  useQuery([`challenge${custom ? '-custom': ''}`, id], () => challengeDetailsRequest(id, custom), {
    onError: (err: any) => {
      if (err && err.message) toast.error(err.message)
    },
  })

