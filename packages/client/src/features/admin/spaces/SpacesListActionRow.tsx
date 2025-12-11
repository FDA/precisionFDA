import { useMutation, UseQueryResult } from '@tanstack/react-query'
import { MetaV2 } from '../../home/types'
import { ISpaceV2 } from '../../spaces/spaces.types'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'
import { BackendError } from '../../../api/errors'
import { Button } from '../../../components/Button'
import React from 'react'
import { ButtonsRow } from '../common'
import { bulkDelete } from './api'
import { useConfirm } from '../../modal/useConfirm'
import { RowSelectionState } from '@tanstack/react-table'
import { ModalScroll } from '../../modal/styles'

type SpaceListActionRowProps = {
  selectedSpaces: ISpaceV2[]
  setSelectedIndexes:  React.Dispatch<React.SetStateAction<RowSelectionState>>
  refetchSpaces: UseQueryResult<{ data: ISpaceV2[]; meta: MetaV2 }>['refetch']
}

export const SpacesListActionRow = ({ selectedSpaces, setSelectedIndexes, refetchSpaces }: SpaceListActionRowProps) => {
  const selectedIds = selectedSpaces.map(({ id }) => id)

  const deleteMutation = useMutation({
    mutationKey: ['bulk-delete'],
    mutationFn: () => bulkDelete(selectedIds),
    onSuccess: () => {
      toast.success('Selected spaces have been deleted')
      refetchSpaces()
      setSelectedIndexes({})
    },
    onError: (e: AxiosError<BackendError>) => {
      if (e.response?.data?.error?.message) {
        toast.error(e.response.data.error.message)
      } else {
        toast.error('Error deleting spaces!')
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
          <p key={space.id}>
            {space.name}
          </p>
        ))}
      </ModalScroll>
    ),
  })

  return (
    <ButtonsRow>
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
  )
}
