import React, { useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Loader } from '../../components/Loader'
import { ResourceTable } from '../../components/ResourceTable'
import { pluralize } from '../../utils/formatting'
import { Modal } from '../modal'
import { ButtonRow } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { databaseMethodRequest } from './databases.api'
import { MethodType } from './databases.types'
import { Button } from '../../components/Button'

export function useMethodModal<T extends { dxid: string; name: string }>({
  method,
  selected,
  onSuccess,
}: {
  method: MethodType
  selected: T[]
  onSuccess?: () => void
}) {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useModal()
  const momoSelected = useMemo(() => selected, [isShown])
  const dxids = momoSelected.map(s => s.dxid)
  const mutation = useMutation({
    mutationKey: ['database-method'],
    mutationFn: (ids: string[]) => databaseMethodRequest(method, ids),
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: ['dbclusters'],
      })
      toast.error(`Error: ${method} database`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dbclusters'],
      })
      if(onSuccess) onSuccess()
      setShowModal(false)
      toast.success(`Success: ${method} database`)
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(dxids)
  }
  const methodText = method.charAt(0).toUpperCase() + method.slice(1)

  const modalComp = (
    <Modal
      data-testid="modal-dbcluster-delete"
      headerText={`${methodText} ${momoSelected.length} ${pluralize('item', momoSelected.length)}`}
      isShown={isShown}
      hide={() => setShowModal(false)}
      footer={
        <ButtonRow>
          {mutation.isPending && <Loader />}
          <Button onClick={() => setShowModal(false)} disabled={mutation.isPending}>Cancel</Button>
          <Button data-variant="primary" onClick={handleSubmit} disabled={mutation.isPending}>
            {methodText}
          </Button>
        </ButtonRow>
      }
    >
      <ResourceTable
        rows={selected.map(s => {
          return {
            name: <div>{s.name}</div>,
            location: <div>{s.location}</div>,
          }
        })}
      />
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
