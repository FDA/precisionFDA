import { useMutation } from '@tanstack/react-query'
import { useHistory } from 'react-router'
import { toast } from 'react-toastify'
import { RunJobRequest, runJob } from '../apps.api'
import { IApp } from '../apps.types'

export const useRunJobMutation = (scope: IApp['scope']) => {
  const history = useHistory()
  return useMutation({
    mutationFn: (payload: RunJobRequest) => runJob(payload),
    onSuccess: res => {
      if (res?.id) {
        if (scope === 'private') {
          history.push(`/home/jobs/${res?.id}`)
        } else {
          const spaceId = scope?.replace('space-', '')
          history.push(`/spaces/${spaceId}/executions/${res?.id}`)
        }
      } else if (res?.error) {
        toast.error(res.error.message)
      } else {
        toast.error('Something went wrong!')
      }
    },
    onError: () => {
      toast.error('Error: Running job.')
    },
  })
}