import React from 'react'
import { useMutation } from 'react-query'
import { toast } from 'react-toastify'
import { Button, ButtonSolidBlue } from '../../../components/Button'
import { Modal } from '../../modal'
import { StyledModalContent } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { FileLicense } from '../assets/assets.types'
import { APIResource } from '../types'
import { detachLicenseRequest } from './api'

export function useDetachLicenseModal<
  T extends { uid?: string; dxid?: string, file_license?: FileLicense },
>({
  selected,
  resource,
  onSuccess,
}: {
  selected: T
  resource: APIResource
  onSuccess?: (res: any) => void
}) {
  const selectedId = selected?.uid || selected?.dxid
  const { isShown, setShowModal } = useModal()

  const editFileMutation = useMutation({
    mutationFn: (payload: { licenseId: string, dxid: string }) => detachLicenseRequest(payload),
    onSuccess: (res: any) => {
      onSuccess && onSuccess(res)
      handleClose()
      toast.success('Success: Detaching license.')
    },
    onError: () => {toast.error('Error: Detaching license.')}
  })
  const handleClose = () => {
    setShowModal(false)
  }
  const onSubmit = () => {
    if(selected?.file_license?.id && selectedId) {
      editFileMutation.mutateAsync({ licenseId: selected.file_license.id, dxid: selectedId })
    }
  }

  const modalComp = (
    <Modal
      data-testid="modal-detach-license-confirmation"
      headerText="Detach License"
      isShown={isShown}
      hide={handleClose}
      footer={
        <>
          <Button onClick={handleClose}>Cancel</Button>
          <ButtonSolidBlue type="button" onClick={onSubmit}>Detach</ButtonSolidBlue>
        </>
      }
    >
      <StyledModalContent>
        Are you sure you want to detach the license: <p><b>{selected?.file_license?.title}</b></p>

      </StyledModalContent>
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
