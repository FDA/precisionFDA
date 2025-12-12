import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { ApiErrorResponse, ServerScope } from '../../home/types'
import { RunJobRequest, runJob } from '../apps.api'
import { toastError } from '../../../components/NotificationCenter/ToastHelper'

export const useRunJobMutation = (scope: ServerScope) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RunJobRequest) => runJob(payload),
    onSuccess: () => {
      if (scope.includes('space-')) {
        // space counters are inside the space object, not standalone counters object
        queryClient.invalidateQueries({ queryKey: ['space', scope.replace('space-', '')] })
      } else {
        queryClient.invalidateQueries({ queryKey: ['counters'] })
      }
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error?.response?.data?.error?.message || ''
      toastError(`Error running app: ${errorMessage}`)
    },
  })
}
