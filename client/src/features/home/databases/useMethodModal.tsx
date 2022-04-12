import React, { useMemo } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { Button, ButtonSolidBlue } from '../../../components/Button'
import { Loader } from '../../../components/Loader'
import { ResourceTable } from '../../../components/ResourceTable'
import { Modal } from '../../modal'
import { ButtonRow } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { databaseMethodRequest } from './databases.api'
import { MethodType } from './databases.types'

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
    mutationFn: (ids: string[]) => databaseMethodRequest(method, ids),
    onError: () => {
      queryClient.invalidateQueries(['dbclusters'])
      toast.error(`Error: ${method} database`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['dbclusters'])
      onSuccess && onSuccess()
      setShowModal(false)
      toast.success(`Success: ${method} database`)
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(dxids)
  }

  const modalComp = (
    <Modal
      data-testid={`modal-dbcluster-delete`}
      headerText={`${method} ${momoSelected.length} items(s)`}
      isShown={isShown}
      hide={() => setShowModal(false)}
      footer={
        <ButtonRow>
          {mutation.isLoading && <Loader />}
          <Button onClick={() => setShowModal(false)} disabled={mutation.isLoading}>Cancel</Button>
          <ButtonSolidBlue onClick={handleSubmit} disabled={mutation.isLoading}>
            {method}
          </ButtonSolidBlue>
        </ButtonRow>
      }
    >
      <ResourceTable
        rows={selected.map(s => {
          return {
            name: <div>{s.name}</div>,
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
