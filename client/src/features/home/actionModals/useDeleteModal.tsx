import React, { useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Button, ButtonSolidBlue } from '../../../components/Button'
import { Loader } from '../../../components/Loader'
import { ResourceTable } from '../../../components/ResourceTable'
import { Modal } from '../../modal'
import { ButtonRow } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { itemsCountString } from '../../../utils/formatting'


export function useDeleteModal<T extends { id: string; name: string; location: string }>({
  resource,
  selected,
  request,
  onSuccess,
}: {
  resource: 'app' | 'asset' | 'workflow'
  selected: T[]
  request: (ids: string[]) => Promise<any>
  onSuccess?: (res: any) => void
}) {
  const { isShown, setShowModal } = useModal()
  const momoSelected = useMemo(() => selected, [isShown])
  const mutation = useMutation({
    mutationKey: ['delete-resource', resource],
    mutationFn: request,
    onError: () => {
      toast.error(`Error: Deleting ${resource}`)
    },
    onSuccess: (res: any) => {
      if (res?.meta?.messages[0].type === 'error') {
        toast.error(`Server error: ${res?.meta?.messages[0].message}`)
        return
      }
      if (onSuccess) onSuccess(res)
      setShowModal(false)
      toast.success(
        `Success: Deleted ${itemsCountString(resource, momoSelected.length)}`,
      )
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(momoSelected.map(s => s.id))
  }

  const modalComp = isShown && (
    <Modal
      data-testid={`modal-${resource}-delete`}
      headerText={`Delete ${itemsCountString(resource, momoSelected.length)}?`}
      isShown={isShown}
      hide={() => setShowModal(false)}
      title={`Modal window to select ${resource}s for deletion`}
      footer={
        <ButtonRow>
          {mutation.isLoading && <Loader />}
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <ButtonSolidBlue onClick={handleSubmit} disabled={mutation.isLoading}>
            Delete
          </ButtonSolidBlue>
        </ButtonRow>
      }
    >
      <ResourceTable
        rows={momoSelected.map(s => ({
          name: <div>{s.name}</div>,
          path: <div>{s.location}</div>,
        }))}
      />
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
