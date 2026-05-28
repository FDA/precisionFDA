import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CircleCheckIcon } from '@/components/icons/CircleCheckIcon'
import { ResourceTable, StyledName } from '@/components/ResourceTable'
import { useModal } from '../modal/useModal'
import type { APIResource } from '../home/types'
import { attachLicenseRequest } from './api'
import type { License } from './types'
import { useLicensesListQuery } from './queries'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../modal/modal.styles'
import { Button } from '@/components/Button'
import { Empty } from '../home/home.styles'
import type { IFile } from '../files/files.types'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'

export function useAttachLicensesModal<
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
  const queryClient = useQueryClient()
  const [selectedLicense, setSelectedLicenses] = useState<string | undefined>()
  useEffect(() => {
    setSelectedLicenses(selectedLicenseRef?.id)
  }, [selectedLicenseRef])

  const { data } = useLicensesListQuery()

  const resetSelected = (): void => {
    setSelectedLicenses(undefined)
  }

  const handleClose = (): void => {
    resetSelected()
    setShowModal(false)
  }

  const handleClickLicense = (s: License): void => {
    setSelectedLicenses(s.id)
  }

  const handleHeaderClose = (): void => {
    setShowModal(false)
  }

  const handleAttachClick = (): void => {
    handleSubmit(selectedLicense)
  }

  const licenses = data?.licenses
  const mutation = useMutation({
    mutationKey: ['attach-license', resource],
    mutationFn: async (payload: { dxid: string; licenseId: string }) => attachLicenseRequest(payload),
    onError: () => {
      toastError('Error: Attaching licenses')
    },
    onSuccess: (res: unknown) => {
      queryClient.invalidateQueries({
        queryKey: ['licenses'],
      })
      if (onSuccess) onSuccess(res)
      resetSelected()
      setShowModal(false)
      toastSuccess('Success: Attaching Licenses')
    },
  })

  const handleSubmit = (selectedLicenseId?: string): void => {
    if (selectedId && selectedLicenseId) {
      mutation.mutateAsync({ dxid: selectedId, licenseId: selectedLicenseId })
    }
  }

  const modalComp = (
    <ModalNext
      id="modal-licenses-attach"
      data-testid="modal-licenses-attach"
      headerText="Select a license"
      isShown={isShown}
      hide={handleClose}
    >
      <ModalHeaderTop headerText="Select a license" hide={handleHeaderClose} />
      {licenses && (
        <ModalScroll className="pb-3 pl-3">
          {licenses.length === 0 ? (
            <Empty data-testid="attach-license-empty">You don&apos;t have any licenses.</Empty>
          ) : (
            <ResourceTable
              rows={licenses.map(s => {
                const isCurrent = selectedLicense === s.id
                return {
                  title: (
                    <StyledName
                      as="div"
                      key={`${s.id}-name`}
                      onClick={() => handleClickLicense(s)}
                      isCurrent={isCurrent}
                      data-testid={`attach-license-option-${s.id}`}
                    >
                      {s.title}
                    </StyledName>
                  ),
                  action: (
                    <button
                      key={`${s.id}-action`}
                      type="button"
                      aria-label={`Select license ${s.title}`}
                      onClick={() => handleClickLicense(s)}
                      className="border-none bg-none p-0 text-success-500"
                      data-testid={`attach-license-option-indicator-${s.id}`}
                    >
                      {isCurrent ? <CircleCheckIcon /> : <div className="h-4 w-4" />}
                    </button>
                  ),
                }
              })}
            />
          )}
          {mutation.isError && mutation.error && (
            <div className="p-3 text-red-500">{mutation.error.message || 'An error occurred'}</div>
          )}
        </ModalScroll>
      )}
      <Footer>
        <ButtonRow>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            data-variant="primary"
            data-testid="attach-license-submit"
            onClick={handleAttachClick}
            disabled={!selectedLicense || selectedLicense === selectedLicenseRef?.id}
          >
            Attach
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
