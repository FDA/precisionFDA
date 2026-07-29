import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Loader } from '@/components/Loader'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, itemsCountString } from '@/utils/formatting'
import { useModal } from '../modal/useModal'
import type { ISpaceReport } from './space-report.types'
import { deleteReports } from './space-reports.api'
import { reportStateToTextMap } from './useSpaceReportColumns'

export function useDeleteSpaceReportModal({
  selected,
  scope,
  onClose,
}: {
  selected: ISpaceReport[]
  scope?: string
  onClose?: () => void
}) {
  const { isShown, setShowModal } = useModal()
  const queryClient = useQueryClient()

  const close = () => {
    if (onClose) onClose()
    setShowModal(false)
  }

  const momoSelected = useMemo(() => selected, [isShown])

  const mutation = useMutation({
    mutationKey: ['delete-space-report'],
    mutationFn: deleteReports,
    onError: () => {
      toastError('Error: Deleting space reports')
    },
    onSuccess: async res => {
      // Invalidate counters to refresh report count in sidebar
      if (scope?.includes('space-')) {
        // space counters are inside the space object, not standalone counters object
        await queryClient.invalidateQueries({ queryKey: ['space', scope.replace('space-', '')] })
      } else {
        await queryClient.invalidateQueries({ queryKey: ['counters'] })
      }
      close()
      toastSuccess(`${itemsCountString('report', res?.length ?? 0)} deleted`)
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(momoSelected.map(s => s.id))
  }

  const title = `Delete ${itemsCountString('report', momoSelected.length)}?`

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={open => !open && close()}>
      <DialogContent id="space-report-delete-modal" variant="medium">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-(--modal-max-height,50vh) flex-1 overflow-auto **:data-[slot=table-container]:overflow-visible">
          <div className="p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead sticky>Created at</TableHead>
                  <TableHead sticky>State</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {momoSelected.map(report => (
                  <TableRow key={report.id}>
                    <TableCell>{formatDate(report.createdAt)}</TableCell>
                    <TableCell>{reportStateToTextMap[report.state]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <DialogFooter className="items-center">
          {mutation.isPending && <Loader />}
          <Button variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={mutation.isPending}>
            Delete
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
