import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Button } from '@/components/Button'
import { Loader } from '@/components/Loader'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { ResourceTable } from '@/components/ResourceTable'
import { itemsCountString } from '@/utils/formatting'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../modal/styles'
import { useModal } from '../modal/useModal'

export interface DeleteResponse {
  meta?: {
    messages: Array<{
      type: 'error' | 'success'
      message: string
    }>
  }
}

interface ApiError extends Error {
  response?: {
    data: {
      error: {
        message: string
      }
    }
  }
}

export function useDeleteModal<T extends { id: string; name: string; location: string }>({
  resource,
  selected,
  request,
  onSuccess,
}: {
  resource: 'app' | 'asset' | 'workflow'
  selected: T[]
  request: (ids: string[]) => Promise<DeleteResponse>
  onSuccess?: (res: DeleteResponse) => void
}) {
  const { isShown, setShowModal } = useModal()
  const momoSelected = useMemo(() => selected, [isShown])
  const mutation = useMutation({
    mutationKey: ['delete-resource', resource],
    mutationFn: request,
    onError: (error: ApiError) => {
      toastError(error.response?.data.error.message ?? error.message)
    },
    onSuccess: (res: DeleteResponse) => {
      if (res?.meta?.messages[0].type === 'error') {
        toastError(`Server error: ${res?.meta?.messages[0].message}`)
        return
      }
      if (onSuccess) onSuccess(res)
      setShowModal(false)
      if (resource !== 'asset') {
        // asset is handled asynchronously
        toastSuccess(`Deleted ${itemsCountString(resource, momoSelected.length)}`)
      }
    },
  })

  const handleSubmit = (): void => {
    mutation.mutateAsync(momoSelected.map(s => s.id))
  }

  const modalComp = (
    <ModalNext
      id="modal-resource-delete"
      data-testid="modal-resource-delete"
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText={`Delete ${itemsCountString(resource, momoSelected.length)}?`}
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
