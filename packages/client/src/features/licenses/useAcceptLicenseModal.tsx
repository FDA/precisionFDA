import { useMutation } from '@tanstack/react-query'
import styled from 'styled-components'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer } from '../modal/modal.styles'
import { useModal } from '../modal/useModal'
import type { APIResource } from '../home/types'
import { acceptLicenseRequest } from './api'
import { Button } from '../../components/Button'
import type { IFile } from '../files/files.types'
import { toastError, toastSuccess } from '../../components/NotificationCenter/ToastHelper'

const ScrollWrapper = styled.div`
  overflow-y: scroll;
  max-height: 500px;
  padding: 1rem;
`

export function useAcceptLicenseModal<
  T extends { uid?: string; dxid?: string; fileLicense?: IFile['fileLicense']; file_license?: IFile['fileLicense'] }
>({
  selected,
  resource: _resource,
  onSuccess,
}: {
  selected: T
  resource: APIResource
  onSuccess?: (res: unknown) => void
}) {
  const selectedLicenseRef = selected?.fileLicense ?? selected?.file_license
  const licenseId = selectedLicenseRef?.id
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
      <ScrollWrapper data-testid="accept-license-body">
        <div>
          Are you sure you want to accept the license:{' '}
          <p>
            <b data-testid="accept-license-name">{selectedLicenseRef?.title}</b>
          </p>
        </div>
        {mutation.isError && mutation.error && <div>{mutation.error.message}</div>}
      </ScrollWrapper>
      <Footer>
        <ButtonRow>
          <Button onClick={handleClose}>Cancel</Button>
          <Button data-testid="accept-license-submit" data-variant="primary" onClick={() => handleSubmit()}>
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
