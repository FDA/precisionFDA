import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'
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
    onError: (error: AxiosError) => {
      const errorMessage = error?.response?.data?.error?.message || ''
      if (errorMessage.includes('BillTo for this job\'s project must have the "httpsApp" feature enabled to run this executable')) {
        toast.error('Error: You do not have permission to run this Workstation. Email Support to get this permission added to your account')
      } else {
        toast.error(`Error running app: ${errorMessage}`)
      }
    },
  })
}