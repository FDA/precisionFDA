import React from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Modal } from '../modal'
import { useModal } from '../modal/useModal'
import { FileLicense } from '../assets/assets.types'
import { APIResource } from '../home/types'
import { acceptLicenseRequest } from './api'
import { Button } from '../../components/Button'


const ScrollWrapper = styled.div`
  overflow-y: scroll;
  max-height: 500px;
  padding: 1rem;
`

export function useAcceptLicenseModal<
  T extends { uid?: string; dxid?: string; file_license?: FileLicense },
>({
  selected,
  resource,
  onSuccess,
}: {
  selected: T
  resource: APIResource
  onSuccess?: (res: any) => void
}) {
  const licenseId = selected?.file_license?.id
  const { isShown, setShowModal } = useModal()

  const mutation = useMutation({
    mutationFn: ({ licenseId }: { licenseId: string }) => {
      return acceptLicenseRequest({ licenseId })
    },
    onError: () => {
      toast.error('Error: Accept license')
    },
    onSuccess: (res: any) => {
      onSuccess && onSuccess(res)
      setShowModal(false)
      toast.success('Success: Accept License')
    },
  })

  const handleSubmit = () => {
    licenseId && mutation.mutateAsync({ licenseId })
  }

  const handleClose = () => {
    setShowModal(false)
  }

  const modalComp = (
    <Modal
      data-testid="modal-accept-licenses"
      headerText={'Accept License'}
      isShown={isShown}
      hide={handleClose}
      footer={
        <>
          <Button onClick={handleClose}>Cancel</Button>
          <Button data-variant="primary" onClick={() => handleSubmit()}>
            Accept
          </Button>
        </>
      }
    >
      <ScrollWrapper>
        <div>
          Are you sure you want to accept the license: <p><b>{selected?.file_license?.title}</b></p>
        </div>

        {mutation.isError && mutation.error}
      </ScrollWrapper>
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
