import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import { removeSpaces } from '../space-groups/spaceGroups.api'

export const useRemoveFromSpaceGroupMutation = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ['remove-spaces-from-space-group'],
    mutationFn: (payload: { spaceGroupId: number, spaceIds: number[] }) => {
      return removeSpaces(payload.spaceGroupId, payload.spaceIds)
    },
    onSuccess: async () => {
      toast.success(
        'Spaces have been removed successfully',
      )
      queryClient.invalidateQueries({ queryKey: ['spaces']})
      queryClient.invalidateQueries({ queryKey: ['space-group-list']})
    },
    onError: (e: AxiosError<{ error: { message: string } }>) => {
      toast.error(e?.response?.data?.error?.message ?? 'Error removing spaces')
    },
  })
  return mutation
}
