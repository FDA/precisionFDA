import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React, { useMemo } from 'react'
import { Button } from '../../../components/Button'
import { Loader } from '../../../components/Loader'
import { itemsCountString } from '../../../utils/formatting'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer, ModalScrollPadding } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { removeSpaces } from '../../space-groups/api'
import { ISpaceGroup } from '../../space-groups/types'
import { ISpaceV2 } from '../spaces.types'
import { ModalSpaceList } from './ModalSpaceList'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'

export const useRemoveSpacesFromSpaceGroupModal = ({ spaces, spaceGroup }: { spaces: ISpaceV2[]; spaceGroup?: ISpaceGroup }) => {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useModal()
  const memoSelected = useMemo(() => spaces, [isShown])

  const spaceIds = useMemo(() => memoSelected.map(s => s.id), [memoSelected])
  const mutation = useMutation({
    mutationKey: ['remove-spaces-from-space-group'],
    mutationFn: (payload: { spaceGroupId: number; spaceIds: number[] }) => {
      return removeSpaces(payload.spaceGroupId, payload.spaceIds)
    },
    onSuccess: async () => {
      toastSuccess('Spaces have been removed successfully')
      queryClient.invalidateQueries({ queryKey: ['spaces'] })
      queryClient.invalidateQueries({ queryKey: ['space-group-list'] })
    },
    onError: (e: AxiosError<{ error: { message: string } }>) => {
      toastError(e?.response?.data?.error?.message ?? 'Error removing spaces')
    },
  })

  const handleSubmit = async () => {
    mutation.mutate({ spaceGroupId: spaceGroup?.id ?? -1, spaceIds })
    setShowModal(false)
  }

  const modalComp = (
    <ModalNext
      id="remove-spaces-from-space-group"
      data-testid="remove-spaces-from-space-group"
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText={`Remove ${itemsCountString('Space', memoSelected.length)} from ${spaceGroup?.name}`}
        hide={() => setShowModal(false)}
      />
      <ModalScrollPadding>
        <ModalSpaceList spaces={memoSelected} />
      </ModalScrollPadding>
      <Footer>
        <ButtonRow>
          {mutation.isPending && <Loader />}
          <Button onClick={() => setShowModal(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button data-variant="warning" onClick={handleSubmit} disabled={spaceIds.length === 0 || mutation.isPending}>
            Remove Spaces
          </Button>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
