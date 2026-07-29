import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Loader } from '../../components/Loader'
import { toastError, toastSuccess } from '../../components/NotificationCenter/ToastHelper'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { pluralize } from '../../utils/formatting'
import { useModal } from '../modal/useModal'
import { databaseMethodRequest } from './databases.api'
import type { MethodType } from './databases.types'

const getVerb = (method: MethodType) => {
  switch (method) {
    case 'start':
      return 'Starting'
    case 'stop':
      return 'Stopping'
    case 'terminate':
      return 'Terminating'
  }
}

export function useMethodModal<T extends { dxid: string; name: string; location?: string }>({
  method,
  selected,
  onSuccess,
}: {
  method: MethodType
  selected: T[]
  onSuccess?: () => void
}) {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useModal()
  const momoSelected = useMemo(() => selected, [isShown])
  const dxids = momoSelected.map(s => s.dxid)
  const mutation = useMutation({
    mutationKey: ['database-method'],
    mutationFn: (ids: string[]) => databaseMethodRequest(method, ids),
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: ['dbclusters'],
      })
      toastError(`${getVerb(method)} the database failed`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dbclusters'],
      })
      if (onSuccess) onSuccess()
      setShowModal(false)
      toastSuccess(`${getVerb(method)} database. This may take a moment`)
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(dxids)
  }
  const methodText = method.charAt(0).toUpperCase() + method.slice(1)
  const title = `${methodText} ${momoSelected.length} ${pluralize('item', momoSelected.length)}`

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent id="method-modal" data-testid="modal-dbcluster-method" variant="medium">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mb-5 p-4 **:data-[slot=table-container]:overflow-visible">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead sticky>Name</TableHead>
                <TableHead sticky>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selected.map(s => (
                <TableRow key={s.dxid}>
                  <TableCell className="whitespace-normal">{s.name}</TableCell>
                  <TableCell className="whitespace-normal">{s.location || ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {method === 'stop' ? (
          <div className="px-4 pb-4">
            <div className="mt-5">
              <p className="mb-2.5">
                This database cluster will be stopped. After seven days, the database cluster will automatically
                re-activate and begin incurring charges. If you do not wish to keep this database cluster, use the
                Terminate action to permanently stop it and delete its contents.
              </p>
            </div>
          </div>
        ) : null}
        <DialogFooter>
          {method === 'stop' ? (
            <p className="mr-auto pl-2">
              By clicking the &#34;Stop&#34; button, you acknowledge and accept this automatic restart behavior.
            </p>
          ) : null}
          <div className="flex items-center justify-end gap-2">
            {mutation.isPending && <Loader />}
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={mutation.isPending}>
              {methodText}
            </Button>
          </div>
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
