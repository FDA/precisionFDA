import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { DownloadIcon } from '../../../components/icons/DownloadIcon'
import { FileIcon } from '../../../components/icons/FileIcon'
import { FolderIcon } from '../../../components/icons/FolderIcon'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'
import { Button } from '../../../components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { itemsCountString } from '../../../utils/formatting'
import type { DownloadListResponse, ServerScope } from '../../home/types'
import { useModal } from '../../modal/useModal'
import { fetchFilesDownloadList } from '../files.api'
import type { IFile } from '../files.types'

const handleDownloadClick = (downloadURL: string) => {
  const win = window.open(downloadURL, '_blank')
  win?.focus()
}

const DownloadFileTable = ({ files }: { files: DownloadListResponse[] }) => (
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
            <TableHead sticky scope="col" className="h-auto w-32 px-4 py-2 text-right" />
          </TableRow>
        </TableHeader>
        <TableBody className="block bg-background sm:table-row-group">
          {files.map(file => (
            <TableRow key={file.uid} className="block p-4 hover:bg-muted/40 sm:table-row sm:p-0">
              <TableCell className="block whitespace-normal p-0 align-middle sm:table-cell sm:px-4 sm:py-3">
                <a
                  href={file.viewURL}
                  target="_blank"
                  className="block w-full max-w-full wrap-break-word whitespace-normal text-left font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  rel="noreferrer"
                >
                  <span className="inline-block align-text-bottom">
                    {file.type === 'file' ? <FileIcon width={14} height={14} /> : <FolderIcon width={14} height={14} />}
                  </span>{' '}
                  <span>{file.name}</span>
                </a>
              </TableCell>
              <TableCell
                className="mt-2 block wrap-break-word whitespace-normal p-0 text-muted-foreground sm:mt-0 sm:table-cell sm:px-4 sm:py-3 sm:align-middle"
                title={file.fsPath}
              >
                {file.fsPath}
              </TableCell>
              <TableCell className="mt-3 block whitespace-normal p-0 align-middle sm:mt-0 sm:table-cell sm:w-32 sm:px-4 sm:py-3">
                <div className="flex justify-end">
                  <Button type="button" size="sm" onClick={() => handleDownloadClick(file.downloadURL)}>
                    Download
                    <DownloadIcon />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
)

const DownloadFiles = ({
  selected,
  setNodesToBeDownloaded,
}: {
  selected: IFile[]
  setNodesToBeDownloaded: (nodes: DownloadListResponse[]) => void
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['download_list', selected],
    queryFn: async () => {
      const fileIds = selected.map(file => file.id)

      return fetchFilesDownloadList(fileIds, 'download', selected[0].scope)
        .then(res => {
          setNodesToBeDownloaded(res)
          return res
        })
        .catch(error => {
          toastError('Error: Fetching download list')
          throw error
        })
    },
  })
  if (isLoading) return <div className="p-3">Loading...</div>
  return data ? <DownloadFileTable files={data} /> : <div />
}

export const useDownloadFileModal = (selected: IFile[], scope: ServerScope) => {
  const { isShown, setShowModal } = useModal()
  const memoSelected = useMemo(() => selected, [isShown])
  const [nodesToBeDownloaded, setNodesToBeDownloaded] = useState<DownloadListResponse[]>()

  const downloadUrl = (scopeParam: ServerScope) => {
    const params = selected.map(file => `id[]=${file.id}`).join('&')
    return `/api/files/bulk_download?scope=${scopeParam}&${params}`
  }
  const title = `Download ${nodesToBeDownloaded ? itemsCountString('item', nodesToBeDownloaded.length) : '...'}`

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent id="modal-download" data-test-id="modal-download" variant="medium">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 overflow-x-auto">
          <DownloadFiles selected={memoSelected} setNodesToBeDownloaded={setNodesToBeDownloaded} />
        </div>
        <DialogFooter className="items-center">
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Cancel
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              handleDownloadClick(downloadUrl(scope))
              setShowModal(false)
              toastSuccess('Download all has been started')
            }}
          >
            Download All as Archive
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
