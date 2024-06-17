import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { ServerScope } from '../../home/types'
import { RunJobRequest, runJob } from '../apps.api'

export const useRunJobMutation = (scope: ServerScope) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RunJobRequest) => runJob(payload),
    onSuccess: () => {
      if (scope.includes('space-')) {
        // space counters are inside the space object, not standalone counters object
        queryClient.invalidateQueries({ queryKey: ['space', scope.replace('space-', '')]})
      } else {
        queryClient.invalidateQueries({ queryKey: ['counters']})
      }
    },
    onError: (error) => {
      toast.error(`Error running app: ${error?.response?.data?.error?.message}`)
    },
  })
}