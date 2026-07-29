import { useMemo } from 'react'
import { DownloadIcon } from '@/components/icons/DownloadIcon'
import { FileIcon } from '@/components/icons/FileIcon'
import { VerticalCenter } from '@/components/Page/page.styles'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { itemsCountString } from '@/utils/formatting'
import { useModal } from '../../modal/useModal'
import type { IAsset } from '../assets.types'

export function useDownloadAssetsModal(selectedFiles: IAsset[]) {
  const { isShown, setShowModal } = useModal()
  const handleDownloadClick = (item: IAsset) => {
    if (item.links.download) {
      const win = window.open(item.links.download, '_blank')
      win?.focus()
    }
  }

  const memoSelected = useMemo(() => selectedFiles, [isShown])
  const title = `Download ${itemsCountString('asset', memoSelected.length)}?`

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent id="modal-assets-download" data-testid="modal-assets-download" variant="medium">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-(--modal-max-height,50vh) flex-1 overflow-auto **:data-[slot=table-container]:overflow-visible">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead sticky>Name</TableHead>
                <TableHead sticky className="w-32 text-right">
                  <span className="sr-only">Action</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memoSelected.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="whitespace-normal">
                    <a
                      data-turbolinks="false"
                      href={`/home/assets/${s.uid}`}
                      target="_blank"
                      className="flex cursor-pointer items-start gap-2 break-all"
                      rel="noreferrer"
                    >
                      <VerticalCenter>
                        <FileIcon />
                      </VerticalCenter>
                      {s.name}
                    </a>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => handleDownloadClick(s)}>
                      <DownloadIcon />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowModal(false)}>
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
