import React, { useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import styled from 'styled-components'
import { AxiosError } from 'axios'
import { Loader } from '../../components/Loader'
import { ResourceTable } from '../../components/ResourceTable'
import { ButtonRow, Footer, ModalScroll } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { APIResource } from '../home/types'
import { resourceCountString } from '../../utils/formatting'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { Button } from '../../components/Button'
import { useConfirmModal } from '../files/actionModals/useConfirmModal'
import { APP_REVISION_CREATION_NOT_REQUESTED, APP_SERIES_CREATION_NOT_REQUESTED } from '../../constants'
import { CONFIRM_APP_REVISION } from '../../constants/consts'
import { toastError, toastSuccess } from '../../components/NotificationCenter/ToastHelper'

const StyledResourceTable = styled(ResourceTable)`
  padding: 0.5rem;
  min-width: 300px;
`

export interface CopyResponse {
  meta?: {
    messages: Array<{
      type: string
      message: string
    }>
  }
}

export function useCopyToPrivateModal<T extends { id: number; name: string }>({
  resource,
  selected,
  copyFunction,
  onSuccess,
}: {
  resource: APIResource
  selected: T[]
  copyFunction: (ids: number[], properties?: Record<string, unknown>) => Promise<CopyResponse>
  onSuccess?: (res: CopyResponse) => void
}) {
  const { isShown, setShowModal } = useModal()
  const momoSelected = useMemo(() => selected, [isShown])

  const mutation = useMutation({
    mutationKey: ['copy-to-private', resource],
    mutationFn: ({ ids, properties }: { ids: number[]; properties?: Record<string, unknown> }) => copyFunction(ids, properties),
    onError: (e: AxiosError<{ error: { code: string; type: string; message: string } }>) => {
      const error = e?.response?.data?.error
      if (
        e.response?.status === 400 &&
        error?.code &&
        [APP_SERIES_CREATION_NOT_REQUESTED, APP_REVISION_CREATION_NOT_REQUESTED].includes(error.code)
      ) {
        setShowConfirmModal(true)
      } else {
        if (error?.message) {
          toastError(`${error?.type}: ${error?.message}`)
          return
        }
        toastError(error?.message || 'An error occurred')
      }
    },
    onSuccess: (res: CopyResponse) => {
      if (res?.meta?.messages[0]?.type === 'error') {
        toastError(`Server error: ${res?.meta?.messages[0].message}`)
      } else {
        if (onSuccess) onSuccess(res)
        setShowModal(false)
        toastSuccess(`Copied ${resourceCountString(resource, momoSelected.length)} to private area`)
      }
    },
  })

  const { modalComp: confirmModal, setShowModal: setShowConfirmModal } = useConfirmModal(
    'Confirm',
    CONFIRM_APP_REVISION,
    async () => {
      setShowConfirmModal(false)
      await mutation.mutateAsync({ ids: momoSelected.map(s => s.id), properties: { createAppRevision: true } })
    },
  )

  const handleSubmit = () => {
    mutation.mutateAsync({ ids: momoSelected.map(s => s.id) })
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
        headerText={`Copy ${resourceCountString(resource, momoSelected.length)} to My Home (private)?`}
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
      {confirmModal}
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
