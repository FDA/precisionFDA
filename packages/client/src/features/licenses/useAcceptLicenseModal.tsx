import { useMutation } from '@tanstack/react-query'
import { toastError, toastSuccess } from '../../components/NotificationCenter/ToastHelper'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import type { IFile } from '../files/files.types'
import type { APIResource } from '../home/types'
import { useModal } from '../modal/useModal'
import { acceptLicenseRequest } from './api'

export function useAcceptLicenseModal<
  T extends { uid?: string; dxid?: string; fileLicense?: IFile['fileLicense']; file_license?: IFile['fileLicense'] },
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
    <Dialog open={Boolean(isShown)} onOpenChange={open => !open && handleClose()}>
      <DialogContent id="accept-license-modal" data-testid="modal-accept-licenses" variant="small">
        <DialogHeader>
          <DialogTitle>Accept License</DialogTitle>
        </DialogHeader>
        <div data-testid="accept-license-body" className="space-y-2 pb-2">
          <p>Are you sure you want to accept the license:</p>
          <p className="font-semibold" data-testid="accept-license-name">
            {selectedLicenseRef?.title}
          </p>
        </div>
        {mutation.isError && mutation.error && <div>{mutation.error.message}</div>}
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button data-testid="accept-license-submit" onClick={() => handleSubmit()}>
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
