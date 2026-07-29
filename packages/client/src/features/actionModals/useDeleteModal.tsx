import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Loader } from '@/components/Loader'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { itemsCountString } from '@/utils/formatting'
import { useModal } from '../modal/useModal'

export interface DeleteResponse {
  meta?: {
    messages: Array<{
      type: 'error' | 'success'
      message: string
    }>
  }
}

interface ApiError extends Error {
  response?: {
    data: {
      error: {
        message: string
      }
    }
  }
}

export function useDeleteModal<T extends { id: string; name: string; location: string }>({
  resource,
  selected,
  request,
  onSuccess,
}: {
  resource: 'app' | 'asset' | 'workflow'
  selected: T[]
  request: (ids: string[]) => Promise<DeleteResponse>
  onSuccess?: (res: DeleteResponse) => void
}) {
  const { isShown, setShowModal } = useModal()
  const momoSelected = useMemo(() => selected, [isShown])
  const mutation = useMutation({
    mutationKey: ['delete-resource', resource],
    mutationFn: request,
    onError: (error: ApiError) => {
      toastError(error.response?.data.error.message ?? error.message)
    },
    onSuccess: (res: DeleteResponse) => {
      if (res?.meta?.messages[0].type === 'error') {
        toastError(`Server error: ${res?.meta?.messages[0].message}`)
        return
      }
      if (onSuccess) onSuccess(res)
      setShowModal(false)
      if (resource !== 'asset') {
        // asset is handled asynchronously
        toastSuccess(`Deleted ${itemsCountString(resource, momoSelected.length)}`)
      }
    },
  })

  const handleSubmit = (): void => {
    mutation.mutateAsync(momoSelected.map(s => s.id))
  }

  const title = `Delete ${itemsCountString(resource, momoSelected.length)}?`

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent id="modal-resource-delete" data-testid="modal-resource-delete" variant="medium">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-(--modal-max-height,50vh) flex-1 overflow-auto **:data-[slot=table-container]:overflow-visible">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead sticky className="font-semibold text-muted-foreground">
                  Name
                </TableHead>
                <TableHead sticky className="font-semibold text-muted-foreground">
                  Location
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {momoSelected.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="whitespace-normal">{s.name}</TableCell>
                  <TableCell className="whitespace-normal">{s.location}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter className="flex-row items-center justify-end">
          {mutation.isPending && <Loader />}
          <Button variant="outline" onClick={() => setShowModal(false)}>
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
