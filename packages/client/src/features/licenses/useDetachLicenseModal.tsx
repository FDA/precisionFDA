import React from 'react'
import { useMutation } from '@tanstack/react-query'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer, StyledModalContent } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { APIResource } from '../home/types'
import { detachLicenseRequest } from './api'
import { Button } from '../../components/Button'
import { IFile } from '../files/files.types'
import { toastError, toastSuccess } from '../../components/NotificationCenter/ToastHelper'

export function useDetachLicenseModal<T extends { uid?: string; dxid?: string; file_license?: IFile['file_license'] }>({
  selected,
  resource,
  onSuccess,
}: {
  selected: T
  resource: APIResource
  onSuccess?: (res: unknown) => void
}) {
  const selectedId = selected?.uid || selected?.dxid
  const { isShown, setShowModal } = useModal()

  const handleClose = () => {
    setShowModal(false)
  }

  const editFileMutation = useMutation({
    mutationKey: ['detach-license', resource],
    mutationFn: (payload: { licenseId: string; dxid: string }) => detachLicenseRequest(payload),
    onSuccess: res => {
      if (onSuccess) onSuccess(res)
      handleClose()
      toastSuccess('Success: Detaching license.')
    },
    onError: () => {
      toastError('Error: Detaching license')
    },
  })

  const onSubmit = () => {
    if (selected?.file_license?.id && selectedId) {
      editFileMutation.mutateAsync({ licenseId: selected.file_license.id, dxid: selectedId })
    }
  }

  const modalComp = (
    <ModalNext
      data-testid="modal-detach-license-confirmation"
      headerText="Detach License"
      isShown={isShown}
      hide={handleClose}
      variant="small"
      id="detach-license-modal"
    >
      <ModalHeaderTop headerText="Detach License" hide={handleClose} />
      <StyledModalContent>
        Are you sure you want to detach the license:{' '}
        <p>
          <b>{selected?.file_license?.title}</b>
        </p>
      </StyledModalContent>
      <Footer>
        <ButtonRow>
          <Button onClick={handleClose}>Cancel</Button>
          <Button data-variant="primary" type="button" onClick={onSubmit}>
            Detach
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
