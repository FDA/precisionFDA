import React, { useMemo } from 'react'
import { useMutation } from 'react-query'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Button, ButtonSolidBlue } from '../../../components/Button'
import { Loader } from '../../../components/Loader'
import { ResourceTable } from '../../../components/ResourceTable'
import { Modal } from '../../modal'
import { ButtonRow, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { APIResource, ResourceScope } from '../types'
import { itemsCountString } from '../utils'

const StyledResourceTable = styled(ResourceTable)`
  padding: 0.5rem;
  min-width: 300px;
`

export function useDeleteModal<T extends { id: string; name: string }>({
  resource,
  selected,
  scope,
  request,
  onSuccess,
}: {
  resource: APIResource
  selected: T[]
  scope?: ResourceScope
  request: (ids: string[]) => Promise<any>
  onSuccess?: (res: any) => void
}) {
  const { isShown, setShowModal } = useModal()
  const momoSelected = useMemo(() => selected, [isShown])
  const mutation = useMutation({
    mutationFn: request,
    onError: () => {
      toast.error(`Error: Deleting ${resource}`)
    },
    onSuccess: (res: any) => {
      if (res?.meta?.messages[0].type === 'error') {
        toast.error(`Server error: ${res?.meta?.messages[0].message}`)
        return
      } else {
        onSuccess && onSuccess(res)
        setShowModal(false)
        toast.success(`Success: Deleted ${itemsCountString(resource, momoSelected.length)}`)
      }
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(momoSelected.map(s => s.id))
  }

  const modalComp = (
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
      <ModalScroll>
        <StyledResourceTable
          rows={selected.map(s => {
            return {
              name: <div>{s.name}</div>,
            }
          })}
        />
      </ModalScroll>
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
