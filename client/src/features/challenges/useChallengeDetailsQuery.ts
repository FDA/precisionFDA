import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { challengeDetailsRequest } from './api'

export const useChallengeDetailsQuery = (id: string, custom?: boolean) =>
  useQuery({
    queryKey: [`challenge${custom ? '-custom': ''}`, id],
    queryFn: () => challengeDetailsRequest(id, custom).catch((err) => {
      if (err && err.message) toast.error(err.message)
    }),
  })

