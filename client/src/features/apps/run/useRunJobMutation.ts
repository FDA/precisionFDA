import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ServerScope } from '../../home/types'
import { RunJobRequest, runJob } from '../apps.api'

export const useRunJobMutation = (scope: ServerScope) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RunJobRequest) => runJob(payload),
    onSuccess: res => {
      if (scope.includes("space-")) {
        // space counters are inside the space object, not standalone counters object
        queryClient.invalidateQueries({ queryKey: ['space', scope.replace('space-', '')] })
      } else {
        queryClient.invalidateQueries({ queryKey: ['counters'] })
      }
      if (res?.id) {
        if (scope === 'private') {
          navigate(`/home/executions/${res.id}`)
        } else {
          const spaceId = scope.replace('space-', '')
          navigate(`/spaces/${spaceId}/executions/${res.id}`)
        }
      } else if (res?.error) {
        toast.error(res.error.message)
      } else {
        toast.error('Something went wrong!')
      }
    },
    onError: () => {
    },
  })
}