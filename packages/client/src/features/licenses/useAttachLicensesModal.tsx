import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { CircleCheckIcon } from '@/components/icons/CircleCheckIcon'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty } from '../home/home.styles'
import type { APIResource } from '../home/types'
import { useModal } from '../modal/useModal'
import { attachLicenseRequest } from './api'
import { useLicensesListQuery } from './queries'
import type { License } from './types'

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
    setSelectedLicenses(currentLicense => (currentLicense === s.id ? undefined : s.id))
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
    <Dialog open={Boolean(isShown)} onOpenChange={open => !open && handleClose()}>
      <DialogContent id="modal-licenses-attach" data-testid="modal-licenses-attach" variant="medium">
        <DialogHeader>
          <DialogTitle>Select a license</DialogTitle>
        </DialogHeader>
        {licenses && (
          <div className="max-h-(--modal-max-height,50vh) flex-1 overflow-auto pb-3 pl-3 **:data-[slot=table-container]:overflow-visible">
            {licenses.length === 0 ? (
              <Empty data-testid="attach-license-empty">You don&apos;t have any licenses.</Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead sticky>License</TableHead>
                    <TableHead sticky className="w-10 text-right">
                      <span className="sr-only">Selected</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenses.map(s => {
                    const isCurrent = selectedLicense === s.id
                    return (
                      <TableRow
                        key={s.id}
                        onClick={() => handleClickLicense(s)}
                        className="cursor-pointer"
                        aria-selected={isCurrent}
                      >
                        <TableCell className="whitespace-normal">
                          <button
                            type="button"
                            className="w-full cursor-pointer border-none bg-transparent p-0 text-left break-all"
                            data-testid={`attach-license-option-${s.id}`}
                          >
                            {s.title}
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            type="button"
                            aria-label={`Select license ${s.title}`}
                            className="border-none bg-transparent p-0 text-success-500"
                            data-testid={`attach-license-option-indicator-${s.id}`}
                          >
                            {isCurrent ? <CircleCheckIcon /> : <div className="h-4 w-4" />}
                          </button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
            {mutation.isError && mutation.error && (
              <div className="p-3 text-red-500">{mutation.error.message || 'An error occurred'}</div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            data-testid="attach-license-submit"
            onClick={handleAttachClick}
            disabled={!selectedLicense || selectedLicense === selectedLicenseRef?.id}
          >
            Attach
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
