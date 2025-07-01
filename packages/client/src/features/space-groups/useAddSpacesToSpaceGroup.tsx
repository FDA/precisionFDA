import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { addSpaces } from './spaceGroups.api'

export const useAddSpacesToSpaceGroup = () => {
  const queryClient = useQueryClient()

  return async (spaceGroupId: number, spaceIds: number[]): Promise<void> => {
    try {
      await addSpaces(spaceGroupId, spaceIds)
      queryClient.invalidateQueries({ queryKey: ['space-group-list']})
      toast.success('Selected spaces were successfully added into the Space Group')
    } catch (addSpaceError: any) {
      toast.error(addSpaceError.response.data.error.message)
    }
  }
}