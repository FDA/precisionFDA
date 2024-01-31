import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ServerScope } from '../../home/types'
import { RunJobRequest, runJob } from '../apps.api'

export const useRunJobMutation = (scope: ServerScope) => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (payload: RunJobRequest) => runJob(payload),
    onSuccess: res => {
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