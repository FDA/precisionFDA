import { useMutation, useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { FileIcon } from '../../../components/icons/FileIcon'
import { FolderIcon } from '../../../components/icons/FolderIcon'
import { Loader } from '../../../components/Loader'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'
import { Button } from '../../../components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { itemsCountString, pluralize } from '../../../utils/formatting'
import type { ApiErrorResponse, DownloadListResponse, ServerScope } from '../../home/types'
import { useModal } from '../../modal/useModal'
import { fetchFilesListLockingRequest, type LockUnlockActionType, lockUnlockFilesRequest } from '../files.api'
import type { IFile } from '../files.types'

const ActionTypeName: Record<LockUnlockActionType, string> = {
  lock: 'Lock',
  unlock: 'Unlock',
}

const LockUnlockFiles = ({
  files,
  statusText,
}: {
  files: DownloadListResponse[] | undefined
  statusText: string | null
}) => {
  if (statusText) return <div className="p-3">{statusText}</div>
  if (!files?.length) return null
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="max-h-[calc(100dvh-14rem)] overflow-auto sm:max-h-[60vh] **:data-[slot=table-container]:overflow-visible">
        <Table className="block w-full text-left sm:table sm:min-w-130 sm:table-fixed">
          <TableHeader className="hidden sm:table-header-group">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead sticky scope="col" className="h-auto w-[40%] px-4 py-2">
                Name
              </TableHead>
              <TableHead sticky scope="col" className="h-auto px-4 py-2">
                Path
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="block bg-background sm:table-row-group">
            {files.map(s => (
              <TableRow key={s.id} className="block p-4 hover:bg-muted/40 sm:table-row sm:p-0">
                <TableCell className="block whitespace-normal p-0 align-middle sm:table-cell sm:px-4 sm:py-3">
                  <a
                    data-turbolinks="false"
                    href={s.viewURL}
                    target="_blank"
                    className="block w-full max-w-full wrap-break-word whitespace-normal text-left font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    rel="noreferrer"
                  >
                    <span className="inline-block align-text-bottom">
                      {s.type === 'file' ? <FileIcon width={14} height={14} /> : <FolderIcon width={14} height={14} />}
                    </span>{' '}
                    <span>{s.name}</span>
                  </a>
                </TableCell>
                <TableCell
                  className="mt-2 block wrap-break-word whitespace-normal p-0 text-muted-foreground sm:mt-0 sm:table-cell sm:px-4 sm:py-3 sm:align-middle"
                  title={s.fsPath}
                >
                  {s.fsPath}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

const DEFAULT_ERROR_MESSAGE = 'An error occurred'

export const useLockUnlockFileModal = ({
  selected,
  onSuccess,
  scope,
  type,
}: {
  selected: IFile[]
  onSuccess?: () => void
  scope?: ServerScope
  type: LockUnlockActionType
}) => {
  const { isShown, setShowModal } = useModal()
  const memoSelected = useMemo(() => selected, [isShown])
  const [numberOfFiles, setNumberOfFiles] = useState<number>()
  const mutation = useMutation({
    mutationKey: ['lock-unlock-files', type],
    mutationFn: (ids: number[]) => lockUnlockFilesRequest(ids, type),
    onError: () => {
      toastError('Error: locking or unlocking')
    },
    onSuccess: () => {
      setShowModal(false)
      toastSuccess(`${ActionTypeName[type]}ing ${numberOfFiles} ${pluralize('file', numberOfFiles ?? 1)}`)
      if (onSuccess) onSuccess()
    },
  })

  useEffect(() => {
    if (!isShown) mutation.reset()
  }, [isShown])

  const {
    data,
    status: downloadStatus,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['download_list', type, selected],
    queryFn: () =>
      fetchFilesListLockingRequest(
        selected.map(s => s.id),
        scope,
        type,
      ).then(d => {
        setNumberOfFiles(d.length)
        return d
      }),
    enabled: isShown,
    retry: (failureCount, retryError: AxiosError<ApiErrorResponse>) => {
      if (retryError?.response?.status === 403) {
        return false
      }

      return failureCount > 3
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(memoSelected.map(s => s.id))
  }

  const getStatusText = () => {
    if (isLoading) {
      return 'Loading...'
    }

    if (downloadStatus === 'error') {
      return error?.response?.data?.error?.message ?? DEFAULT_ERROR_MESSAGE
    }

    if (mutation.status === 'error') {
      return DEFAULT_ERROR_MESSAGE
    }

    if (!data?.length) {
      return `Your selection does not include any files that can be ${type}ed.`
    }

    return null
  }

  const isSubmitDisabled = () => {
    return downloadStatus !== 'success' || mutation.status !== 'idle' || !data?.length
  }
  const title = `${ActionTypeName[type]} ${numberOfFiles ? itemsCountString('item', numberOfFiles) : '...'}`

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent id="modal-files-lock-unlock" data-testid="modal-files-lock-unlock" variant="medium">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <LockUnlockFiles files={data} statusText={getStatusText()} />

        <DialogFooter className="items-center">
          {mutation.isPending && <Loader />}
          <Button variant="outline" onClick={() => setShowModal(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitDisabled()}>
            {ActionTypeName[type]}
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
