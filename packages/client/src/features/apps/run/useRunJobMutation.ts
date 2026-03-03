import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toastError } from '@/components/NotificationCenter/ToastHelper'
import { ApiErrorResponse, ServerScope } from '../../home/types'
import { runJob, RunJobRequest } from '../apps.api'

export const useRunJobMutation = (scope: ServerScope) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RunJobRequest) => runJob(payload),
    onSuccess: () => {
      if (scope.includes('space-')) {
        // Invalidates both the space object and the space counters query (via prefix matching)
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
