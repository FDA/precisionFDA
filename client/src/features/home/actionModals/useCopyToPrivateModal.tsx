import React, { useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Button, ButtonSolidBlue } from '../../../components/Button'
import { Loader } from '../../../components/Loader'
import { ResourceTable } from '../../../components/ResourceTable'
import { ButtonRow, Footer, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { APIResource, ResourceScope } from '../types'
import { itemsCountString } from '../../../utils/formatting'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'

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
    mutationKey: ['copy-to-private', resource],
    mutationFn: request,
    onError: () => {
      toast.error(`Error: Copying to private ${resource}`)
    },
    onSuccess: (res: any) => {
      if (res?.meta?.messages[0].type === 'error') {
        toast.error(`Server error: ${res?.meta?.messages[0].message}`)
      } else {
        if (onSuccess) onSuccess(res)
        setShowModal(false)
        toast.success(
          `Success: Copy to private ${itemsCountString(
            resource,
            momoSelected.length,
          )}`,
        )
      }
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(momoSelected.map(s => s.id))
  }

  const modalComp = isShown && (
    <ModalNext
      data-testid={`modal-${resource}-copy-to-private`}
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText={`Copy to private ${itemsCountString(
          resource,
          momoSelected.length,
        )}?`}
        hide={() => setShowModal(false)}
      />
      <ModalScroll>
        <StyledResourceTable
          rows={selected.map(s => {
            return {
              name: <div>{s.name}</div>,
            }
          })}
        />
      </ModalScroll>
      <Footer>
        <ButtonRow>
          {mutation.isLoading && <Loader />}
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <ButtonSolidBlue onClick={handleSubmit} disabled={mutation.isLoading}>
            Copy
          </ButtonSolidBlue>
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
