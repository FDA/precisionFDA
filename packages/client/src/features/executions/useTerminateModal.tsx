import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Loader } from '../../components/Loader'
import { toastError, toastSuccess } from '../../components/NotificationCenter/ToastHelper'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { useModal } from '../modal/useModal'
import { terminateJobsRequest } from './executions.api'
import type { IExecution } from './executions.types'

export function useTerminateModal({ selected }: { selected: IExecution[] }) {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useModal()
  const memoSelected = useMemo(() => selected, [isShown])
  const mutation = useMutation({
    mutationKey: ['terminate-job'],
    mutationFn: terminateJobsRequest,
    onError: () => {
      toastError('Error: terminating execution')
    },
    onSuccess: res => {
      if (res?.meta?.messages[0]) {
        toastError(`Server error: ${res?.meta?.messages[0].message}`)
        return
      }
      queryClient.invalidateQueries({
        queryKey: ['jobs'],
      })
      queryClient.invalidateQueries({
        queryKey: ['execution', selected[0].uid],
      })
      setShowModal(false)
      toastSuccess(`Success: ${res?.message?.text}`)
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(memoSelected.map(x => x.uid))
  }

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent id="terminate-executions-modal" data-testid="modal-execution-terminate" variant="medium">
        <DialogHeader>
          <DialogTitle>Terminate selected execution?</DialogTitle>
        </DialogHeader>
        <div className="max-h-(--modal-max-height,50vh) flex-1 overflow-auto **:data-[slot=table-container]:overflow-visible">
          <div className="min-w-75 p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead sticky>Name</TableHead>
                  <TableHead sticky>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selected.map(s => (
                  <TableRow key={s.uid}>
                    <TableCell className="whitespace-normal">{s.name}</TableCell>
                    <TableCell className="whitespace-normal">{s.scope}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <DialogFooter className="items-center">
          {mutation.isPending && <Loader />}
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={mutation.isPending}>
            Terminate
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
