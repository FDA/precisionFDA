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
import { itemsCountString } from '../../../utils/formatting'

const StyledResourceTable = styled(ResourceTable)`
  padding: 0.5rem;
  min-width: 300px;
`



export function useCopyToPrivateModal<T extends { id: string; name: string }>({
  resource,
  selected,
  scope,
  request,
  onSuccess,
}: {
  resource: APIResource
  selected: T[]
  request: (ids: string[]) => Promise<any>
  scope?: ResourceScope
  onSuccess?: (res: any) => void
}) {
  const { isShown, setShowModal } = useModal()
  const momoSelected = useMemo(() => selected, [isShown])
  const mutation = useMutation({
    mutationFn: request,
    onError: () => {
      toast.error(`Error: Copying to private ${resource}`)
    },
    onSuccess: (res: any) => {
      if (res?.meta?.messages[0].type === 'error') {
        toast.error(`Server error: ${res?.meta?.messages[0].message}`)
        return
      } else {
        onSuccess && onSuccess(res)
        setShowModal(false)
        toast.success(`Success: Copy to private ${itemsCountString(resource, momoSelected.length)}`)
      }
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(momoSelected.map(s => s.id))
  }

  const modalComp = (
    <Modal
      data-testid={`modal-${resource}-copy-to-private`}
      headerText={`Copy to private ${itemsCountString(resource, momoSelected.length)}?`}
      isShown={isShown}
      hide={() => setShowModal(false)}
      footer={
        <ButtonRow>
          {mutation.isLoading && <Loader />}
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <ButtonSolidBlue onClick={handleSubmit} disabled={mutation.isLoading}>
            Copy
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
