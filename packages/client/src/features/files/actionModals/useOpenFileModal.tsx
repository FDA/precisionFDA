import { useQuery } from '@tanstack/react-query'
import { ExternalLink } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import { FileIcon } from '@/components/icons/FileIcon'
import { toastError } from '@/components/NotificationCenter/ToastHelper'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { pluralize, sanitizeFileName } from '@/utils/formatting'
import type { DownloadListResponse } from '../../home/types'
import { useModal } from '../../modal/useModal'
import { fetchFilesDownloadList } from '../files.api'
import type { IFile } from '../files.types'

interface OpenFileListProps {
  selectedFiles: IFile[]
  onSelectedLengthChange: (length: number) => void
}

interface OpenFileTableProps {
  files: DownloadListResponse[]
  onOpen: (item: DownloadListResponse) => void
}

const OpenFileTable: React.FC<OpenFileTableProps> = ({ files, onOpen }) => {
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
              <TableHead sticky scope="col" className="h-auto w-32 px-4 py-2 text-right" />
            </TableRow>
          </TableHeader>
          <TableBody className="block bg-background sm:table-row-group">
            {files.map(file => (
              <TableRow key={file.uid} className="block p-4 hover:bg-muted/40 sm:table-row sm:p-0">
                <TableCell className="block whitespace-normal p-0 align-middle sm:table-cell sm:px-4 sm:py-3">
                  <button
                    type="button"
                    data-turbolinks="false"
                    className="flex w-full max-w-full items-start gap-1 whitespace-normal text-left font-medium text-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    onClick={() => onOpen(file)}
                  >
                    <span className="mt-0.5 shrink-0">
                      <FileIcon width={14} height={14} />
                    </span>
                    <span className="min-w-0 wrap-anywhere">{file.name}</span>
                  </button>
                </TableCell>
                <TableCell
                  className="mt-2 block wrap-break-word whitespace-normal p-0 text-muted-foreground sm:mt-0 sm:table-cell sm:px-4 sm:py-3 sm:align-middle"
                  title={file.fsPath}
                >
                  {file.fsPath}
                </TableCell>
                <TableCell className="mt-3 block whitespace-normal p-0 align-middle sm:mt-0 sm:table-cell sm:w-32 sm:px-4 sm:py-3">
                  <div className="flex justify-end">
                    <Button type="button" size="sm" onClick={() => onOpen(file)}>
                      Open
                      <ExternalLink className="size-4" />
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
}

const OpenFileList: React.FC<OpenFileListProps> = ({
  selectedFiles,
  onSelectedLengthChange,
}: OpenFileListProps): React.ReactElement => {
  const handleOpenClick = (item: DownloadListResponse): void => {
    const win = window.open(`/api/v2/files/${item.uid}/${sanitizeFileName(item.name)}?inline=true`, '_blank')
    win?.focus()
  }

  const { data } = useQuery({
    queryKey: ['download_list', selectedFiles],
    queryFn: async () => {
      const fileIds = selectedFiles.map(file => file.id)

      return fetchFilesDownloadList(fileIds, 'open', selectedFiles[0].scope).catch(error => {
        toastError('Failed to load file list')
        throw error
      })
    },
  })

  useEffect(() => {
    onSelectedLengthChange(data?.length ?? 0)
  }, [data?.length, onSelectedLengthChange])

  return <>{data && <OpenFileTable files={data} onOpen={handleOpenClick} />}</>
}

export const useOpenFileModal = (
  selectedFiles: IFile[],
): { modalComp: React.ReactElement; setShowModal: (show: boolean) => void; isShown: boolean } => {
  const { isShown, setShowModal } = useModal()
  const [selectedLength, setSelectedLength] = useState<number>(0)

  const hideModal = (): void => {
    setShowModal(false)
  }

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent
        id="modal-files-organize"
        data-testid="modal-files-organize"
        className="max-h-[calc(100dvh-2rem)] overflow-hidden sm:max-w-3xl"
      >
        <DialogHeader>
          <DialogTitle>{`Open ${selectedLength} ${pluralize('item', selectedLength)}`}</DialogTitle>
          <DialogDescription className="sr-only">Select a file to open in a new tab.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-x-auto">
          <OpenFileList selectedFiles={selectedFiles} onSelectedLengthChange={setSelectedLength} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={hideModal}>
            Cancel
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
