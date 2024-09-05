import React, { useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Loader } from '../../components/Loader'
import { ResourceTable } from '../../components/ResourceTable'
import { ButtonRow, Footer, ModalScroll } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { APIResource, HomeScope } from '../home/types'
import { resourceCountString } from '../../utils/formatting'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { Button } from '../../components/Button'

const StyledResourceTable = styled(ResourceTable)`
  padding: 0.5rem;
  min-width: 300px;
`

export function useCopyToPrivateModal<T extends { id: number; name: string }>({
  resource,
  selected,
  scope,
  request,
  onSuccess,
}: {
  resource: APIResource
  selected: T[]
  request: (ids: number[]) => Promise<any>
  scope?: HomeScope
  onSuccess?: (res: any) => void
}) {
  const { isShown, setShowModal } = useModal()
  const momoSelected = useMemo(() => selected, [isShown])
  const mutation = useMutation({
    mutationKey: ['copy-to-private', resource],
    mutationFn: request,
    onError: () => {
      toast.error(`Error: Copying ${resource} to private area`)
    },
    onSuccess: (res: any) => {
      if (res?.meta?.messages[0].type === 'error') {
        toast.error(`Server error: ${res?.meta?.messages[0].message}`)
      } else {
        if (onSuccess) onSuccess(res)
        setShowModal(false)
        toast.success(
          `Copied ${resourceCountString(
            resource,
            momoSelected.length,
          )} to private area`,
        )
      }
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(momoSelected.map(s => s.id))
  }

  const modalComp = (
    <ModalNext
      id={`modal-${resource}-copy-to-private`}
      data-testid={`modal-${resource}-copy-to-private`}
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText={`Copy ${resourceCountString(
          resource,
          momoSelected.length,
        )} to My Home (private)?`}
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
          {mutation.isPending && <Loader />}
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button data-variant="primary" onClick={handleSubmit} disabled={mutation.isPending}>
            Copy
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
