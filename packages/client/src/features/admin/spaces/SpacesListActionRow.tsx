import { useMutation, UseQueryResult } from '@tanstack/react-query'
import { RowSelectionState } from '@tanstack/react-table'
import { AxiosError } from 'axios'
import React from 'react'
import { BackendError } from '../../../api/types'
import { Button } from '../../../components/Button'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'
import { MetaV2 } from '../../home/types'
import { ModalScroll } from '../../modal/styles'
import { useConfirm } from '../../modal/useConfirm'
import { ISpaceV2 } from '../../spaces/spaces.types'
import { useSpaceHiddenMutation } from '../../spaces/useSpaceHiddenMutation'
import { ButtonsRow } from '../common'
import { bulkDelete } from './api'
import { useRecoverSpaceLeadModal } from './useRecoverSpaceLeadModal'

type SpaceListActionRowProps = {
  selectedSpaces: ISpaceV2[]
  setSelectedIndexes: React.Dispatch<React.SetStateAction<RowSelectionState>>
  refetchSpaces: UseQueryResult<{ data: ISpaceV2[]; meta: MetaV2 }>['refetch']
}

export const SpacesListActionRow = ({ selectedSpaces, setSelectedIndexes, refetchSpaces }: SpaceListActionRowProps) => {
  const selectedIds = selectedSpaces.map(({ id }) => id)

  const deleteMutation = useMutation({
    mutationKey: ['bulk-delete'],
    mutationFn: () => bulkDelete(selectedIds),
    onSuccess: () => {
      toastSuccess('Selected spaces have been deleted')
      refetchSpaces()
      setSelectedIndexes({})
    },
    onError: (e: AxiosError<BackendError>) => {
      if (e.response?.data?.error?.message) {
        toastError(e.response.data.error.message)
      } else {
        toastError('Error deleting spaces!')
      }
    },
  })

  const { open: openConfirmation, Confirm: ConfirmSubmit } = useConfirm({
    onOk: deleteMutation.mutateAsync,
    okText: 'Delete Spaces',
    headerText: 'Delete Spaces',
    dataVariant: 'warning',
    body: (
      <ModalScroll>
        <p>Are you sure you would like to delete following spaces?</p>
        <br />
        {selectedSpaces.map(space => (
          <p key={space.id}>{space.name}</p>
        ))}
      </ModalScroll>
    ),
  })

  const spaceHiddenMutation = useSpaceHiddenMutation()
  const hideSpaces = () => {
    const ids = selectedSpaces.map(s => s.id)
    spaceHiddenMutation.mutateAsync({ ids, hidden: true })
  }

  const recoverSpaceLeadModal = useRecoverSpaceLeadModal({
    space: selectedSpaces[0],
  })

  return (
    <>
      <ButtonsRow>
        <Button
          data-variant="primary"
          disabled={selectedSpaces.length !== 1}
          onClick={() => {
            recoverSpaceLeadModal.setShowModal(true)
          }}
        >
          Recover Space Lead
        </Button>
        <Button data-variant="primary" disabled={selectedSpaces.length === 0} onClick={hideSpaces}>
          Hide Spaces
        </Button>
        <Button
          data-variant="warning"
          data-testid="admin-users-activate-button"
          disabled={selectedSpaces.length === 0}
          onClick={() => openConfirmation()}
        >
          Delete
        </Button>
        <ConfirmSubmit />
      </ButtonsRow>
      {recoverSpaceLeadModal?.modalComp}
    </>
  )
}
