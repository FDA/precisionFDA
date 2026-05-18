import { useMutation } from '@tanstack/react-query'
import type { ReactElement } from 'react'
import { Button } from '@/components/Button'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import type { APIResource } from '../home/types'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer, StyledModalContent } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { detachLicenseRequest } from './api'

export function useDetachLicenseModal<
  T extends {
    uid?: string
    dxid?: string
    fileLicense?: { id?: string; title?: string } | null
    file_license?: { id?: string; title?: string } | null
  },
>({
  selected,
  resource,
  onSuccess,
}: {
  selected: T
  resource: APIResource
  onSuccess?: (res: unknown) => void
}): {
  modalComp: ReactElement
  setShowModal: (value: boolean) => void
  isShown: boolean
} {
  const selectedLicenseRef = selected?.fileLicense ?? selected?.file_license
  const selectedId = selected?.uid || selected?.dxid
  const { isShown, setShowModal } = useModal()

  const handleClose = (): void => {
    setShowModal(false)
  }

  const editFileMutation = useMutation({
    mutationKey: ['detach-license', resource],
    mutationFn: (payload: { licenseId: string; dxid: string }) => detachLicenseRequest(payload),
    onSuccess: (res: unknown) => {
      if (onSuccess) onSuccess(res)
      handleClose()
      toastSuccess('Success: Detaching license.')
    },
    onError: () => {
      toastError('Error: Detaching license')
    },
  })

  const onSubmit = (): void => {
    if (selectedLicenseRef?.id && selectedId) {
      editFileMutation.mutateAsync({ licenseId: selectedLicenseRef.id, dxid: selectedId })
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
          <b>{selectedLicenseRef?.title}</b>
        </p>
      </StyledModalContent>
      <Footer>
        <ButtonRow>
          <Button onClick={handleClose}>Cancel</Button>
          <Button data-testid="detach-license-submit" data-variant="primary" type="button" onClick={onSubmit}>
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
