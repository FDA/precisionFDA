import { useState } from 'react'
import { Tooltip } from 'react-tooltip'
import CodeMirrorEditor from '@/components/CodeMirrorEditor/CodeMirrorEditor'
import { toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/utils/cn'
import { useFetchFilesByUIDQuery } from '../../files/query/useFetchFilesByUIDQuery'
import { useModal } from '../../modal/useModal'
import type { IApp } from '../apps.types'
import { generateCopyUrl } from './utils'

export const useExportInputsModal = ({ showCopyButton, app }: { showCopyButton: boolean; app: IApp }) => {
  const { isShown, setShowModal } = useModal()
  const [displayData, setDisplayData] = useState('')
  const [fileUids, setFileUids] = useState<string[]>([])

  const { isFetching, data: userListFiles } = useFetchFilesByUIDQuery(fileUids || [])
  // const areAllFilePublic = userListFiles?.data.every(f => f.scope === 'public')
  // Temporarily disabling public files check
  const areAllFilePublic = true
  const areFiles = (userListFiles?.data.length ?? 0) > 0
  const copyDisabled = isFetching || (areFiles && !areAllFilePublic)

  const openModal = async (data: unknown, fuids: string[]) => {
    setShowModal(true)
    setFileUids(fuids)
    setDisplayData(JSON.stringify(data))
  }

  const handleCopy = (copyType: 'app' | 'appSeries') => {
    if (displayData === '') {
      return
    }

    const url = generateCopyUrl(displayData, window.location.href, app, copyType)

    toastSuccess('The link has been copied into your clipboard')
    navigator.clipboard.writeText(url)
  }

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={open => !open && setShowModal(false)}>
      <DialogContent
        id="modal-export-inputs"
        data-testid="modal-export-inputs"
        variant="medium"
        className="min-w-0 gap-4 overflow-hidden"
      >
        <DialogHeader>
          <DialogTitle>Export Input Values</DialogTitle>
        </DialogHeader>
        <div className="min-w-0 max-h-(--modal-max-height,50vh) flex-1 overflow-auto">
          <CodeMirrorEditor
            options={{
              minimap: {
                enabled: false,
              },
              padding: { top: 16 },
            }}
            formatDocument
            defaultLanguage="json"
            height="40vh"
            width="100%"
            onChange={val => setDisplayData(val ?? '')}
            value={displayData}
          />
        </div>
        <DialogFooter
          className={cn('flex-row flex-wrap items-center gap-2', showCopyButton ? 'justify-between' : 'justify-end')}
        >
          {showCopyButton ? (
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={copyDisabled}
                type="button"
                variant="outline"
                onClick={() => handleCopy('app')}
                data-tooltip-id="selected-private-file-error"
                data-tooltip-content="One or more files are private. Make sure to make those files public to share."
              >
                Copy link for Current App
              </Button>
              <Button
                disabled={copyDisabled}
                type="button"
                variant="outline"
                onClick={() => handleCopy('appSeries')}
                data-tooltip-id="selected-private-file-error"
                data-tooltip-content="One or more files are private. Make sure to make those files public to share."
              >
                Copy link for Latest App
              </Button>
              {areFiles && !areAllFilePublic && <Tooltip id="selected-private-file-error" />}
            </div>
          ) : null}
          <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
  return {
    modalComp,
    openModal,
  }
}
