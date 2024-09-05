import { useMutation } from '@tanstack/react-query'
import React, { useMemo } from 'react'
import { toast } from 'react-toastify'
import { Loader } from '../../components/Loader'
import { ResourceTable } from '../../components/ResourceTable'
import { itemsCountString } from '../../utils/formatting'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { Button } from '../../components/Button'

export function useDeleteModal<
  T extends { id: string; name: string; location: string },
>({
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
      toast.error(`There was a problem deleting: ${resource}`)
    },
    onSuccess: (res: any) => {
      if (res?.meta?.messages[0].type === 'error') {
        toast.error(`Server error: ${res?.meta?.messages[0].message}`)
        return
      }
      if (onSuccess) onSuccess(res)
      setShowModal(false)
      toast.success(
        `Deleted ${itemsCountString(resource, momoSelected.length)}`,
      )
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(momoSelected.map(s => s.id))
  }

  const modalComp = (
    <ModalNext
      id="modal-resource-delete"
      data-test-id="modal-resource-delete"
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText={`Delete ${itemsCountString(
          resource,
          momoSelected.length,
        )}?`}
        hide={() => setShowModal(false)}
      />
      <ModalScroll>
        <ResourceTable
          rows={momoSelected.map(s => ({
            name: <div>{s.name}</div>,
            path: <div>{s.location}</div>,
          }))}
        />
      </ModalScroll>
      <Footer>
        <ButtonRow>
          {mutation.isPending && <Loader />}
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button data-variant="warning" onClick={handleSubmit} disabled={mutation.isPending}>
            Delete
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
