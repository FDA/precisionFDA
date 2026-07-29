import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { FileIcon } from '../../../components/icons/FileIcon'
import { FolderIcon } from '../../../components/icons/FolderIcon'
import { Loader } from '../../../components/Loader'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'
import { Button } from '../../../components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { getSpaceIdFromScope } from '../../../utils'
import { itemsCountString } from '../../../utils/formatting'
import { cleanObject } from '../../../utils/object'
import { getHomeScopeFromServerScope } from '../../home/getHomeScopeFromServerScope'
import type { ApiErrorResponse, DownloadListResponse, ServerScope } from '../../home/types'
import { getBasePathFromScope } from '../../home/utils'
import { useModal } from '../../modal/useModal'
import { deleteFilesRequest, fetchFilesDownloadList } from '../files.api'
import type { IFile } from '../files.types'
import { getMessage } from './modal-utils'

const buildFolderHref = (basePath: string, folderId: number, serverScope?: ServerScope) => {
  const spaceId = getSpaceIdFromScope(serverScope)
  const params = cleanObject({
    // Home lists need scope; space routes are scoped by the path itself.
    scope: spaceId ? undefined : getHomeScopeFromServerScope(serverScope ?? 'private'),
    folderId: String(folderId),
  })
  const query = new URLSearchParams(params as Record<string, string>).toString()
  return `${basePath}/files?${query}`
}

const DeleteFiles = ({
  selected,
  setNodesToBeDeleted,
}: {
  selected: IFile[]
  setNodesToBeDeleted: (nodes: DownloadListResponse[]) => void
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['download_list', selected],
    queryFn: async () => {
      // Group files by scope name
      const filesByScopes = new Map<string, IFile[]>()
      selected.forEach(file => {
        if (!filesByScopes.has(file.scope)) {
          filesByScopes.set(file.scope, [])
        }
        const files = filesByScopes.get(file.scope)
        if (files) {
          files.push(file)
        }
      })

      const promises: Promise<DownloadListResponse[]>[] = []
      filesByScopes.forEach((files, scope) => {
        promises.push(
          fetchFilesDownloadList(
            files.map(s => s.id),
            'delete',
            scope,
          ),
        )
      })

      return Promise.all(promises).then(fileArrays => Promise.resolve(fileArrays.flat()))
    },
  })

  useEffect(() => {
    if (data) setNodesToBeDeleted(data)
  }, [data])
  if (isLoading) return <div className="p-3">Loading...</div>
  return data ? (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead sticky>Name</TableHead>
          <TableHead sticky>Path</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(item => {
          const selectedItem = selected.find(file => file.id === item.id)
          const basePath = getBasePathFromScope(selectedItem?.scope)
          const itemPath =
            item.type === 'folder'
              ? buildFolderHref(basePath, item.id, selectedItem?.scope)
              : `${basePath}/files/${item.uid}`

          return (
            <TableRow key={item.id}>
              <TableCell className="whitespace-normal">
                <a
                  href={selectedItem ? itemPath : item.viewURL}
                  target="_blank"
                  className="cursor-pointer break-all"
                  rel="noreferrer"
                >
                  <span className="inline-block align-text-bottom">
                    {item.type === 'file' ? <FileIcon width={14} height={14} /> : <FolderIcon width={14} height={14} />}
                  </span>{' '}
                  <span>{item.name}</span>
                </a>
              </TableCell>
              <TableCell className="min-w-37.5 whitespace-normal">{item.fsPath}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  ) : (
    <div />
  )
}

export const useDeleteFileModal = ({ selected, onSuccess }: { selected: IFile[]; onSuccess: () => void }) => {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useModal()
  const memoSelected = useMemo(() => selected, [isShown])
  const [nodesToBeDeleted, setNodesToBeDeleted] = useState<DownloadListResponse[]>([])

  const mutation = useMutation({
    mutationKey: ['delete-files'],
    mutationFn: (ids: number[]) => deleteFilesRequest(ids),
    onError: (e: AxiosError<ApiErrorResponse>) => {
      const error = e?.response?.data?.error
      if (error?.message) {
        toastError(error?.message)
        return
      }
      toastError(`Deleting of ${getMessage(nodesToBeDeleted)} has failed`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['files'],
      })
      // TODO counters are only for My Home, spaces have counters in request for space
      queryClient.invalidateQueries({
        queryKey: ['counters'],
      })
      setShowModal(false)
      toastSuccess(`Deleting of ${getMessage(nodesToBeDeleted)} has been started`, {})
      onSuccess()
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(nodesToBeDeleted.map(s => s.id))
  }
  const title = `Delete ${nodesToBeDeleted ? itemsCountString('item', nodesToBeDeleted.length) : '...'}`

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent id="modal-files-delete" data-testid="modal-files-delete" variant="medium">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-(--modal-max-height,50vh) flex-1 overflow-auto **:data-[slot=table-container]:overflow-visible">
          <DeleteFiles selected={memoSelected} setNodesToBeDeleted={setNodesToBeDeleted} />
        </div>
        <DialogFooter className="items-center">
          {mutation.isPending && <Loader />}
          <Button variant="outline" onClick={() => setShowModal(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!nodesToBeDeleted.length || mutation.isPending}
          >
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
