import React from 'react'
import { useMutation } from '@tanstack/react-query'
import styled from 'styled-components'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { APIResource } from '../home/types'
import { acceptLicenseRequest } from './api'
import { Button } from '../../components/Button'
import { IFile } from '../files/files.types'
import { toastError, toastSuccess } from '../../components/NotificationCenter/ToastHelper'

const ScrollWrapper = styled.div`
  overflow-y: scroll;
  max-height: 500px;
  padding: 1rem;
`

export function useAcceptLicenseModal<T extends { uid?: string; dxid?: string; file_license?: IFile['file_license'] }>({
  selected,
  onSuccess,
}: {
  selected: T
  resource: APIResource
  onSuccess?: (res: unknown) => void
}) {
  const licenseId = selected?.file_license?.id
  const { isShown, setShowModal } = useModal()

  const mutation = useMutation({
    mutationFn: ({ licenseId: id }: { licenseId: string }) => {
      return acceptLicenseRequest({ licenseId: id })
    },
    onError: () => {
      toastError('Error: Accept license')
    },
    onSuccess: (res: unknown) => {
      if (onSuccess) {
        onSuccess(res)
      }
      setShowModal(false)
      toastSuccess('Success: Accept License')
    },
  })

  const handleSubmit = () => {
    if (licenseId) {
      mutation.mutateAsync({ licenseId })
    }
  }

  const handleClose = () => {
    setShowModal(false)
  }

  const modalComp = (
    <ModalNext
      data-testid="modal-accept-licenses"
      headerText="Accept License"
      isShown={isShown}
      hide={handleClose}
      variant="medium"
      id="accept-license-modal"
    >
      <ModalHeaderTop headerText="Accept License" hide={handleClose} />
      <ScrollWrapper>
        <div>
          Are you sure you want to accept the license:{' '}
          <p>
            <b>{selected?.file_license?.title}</b>
          </p>
        </div>
        {mutation.isError && mutation.error && <div>{mutation.error.message}</div>}
      </ScrollWrapper>
      <Footer>
        <ButtonRow>
          <Button onClick={handleClose}>Cancel</Button>
          <Button data-variant="primary" onClick={() => handleSubmit()}>
            Accept
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
