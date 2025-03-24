import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import { updateSpacesHidden } from './spaces.api'

export const useSpaceHiddenMutation = () => {
  const queryClient = useQueryClient()
  const hiddenMutation = useMutation({
    mutationKey: ['site-admin-hide-spaces', 'hide-spaces'],
    mutationFn: (payload: { ids: number[]; hidden: boolean }) => {
      return updateSpacesHidden(payload.ids, payload.hidden)
    },
    onSuccess: async (data: void, variables: { ids: number[]; hidden: boolean }) => {
      toast.success(
        `${variables.ids.length > 0 ? 'Spaces have' : 'Space has'} been ${variables.hidden ? 'hidden' : 'unhidden'} successfully`,
      )
      queryClient.invalidateQueries({ queryKey: ['spaces'] })
    },
    onError: (e: AxiosError<{ error: { message: string } }>) => {
      toast.error(e?.response?.data?.error?.message ?? 'Error hiding spaces')
    },
  })
  return hiddenMutation
}
