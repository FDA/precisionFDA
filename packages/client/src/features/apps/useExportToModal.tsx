import type React from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useModal } from '../modal/useModal'
import type { IWorkflow } from '../workflows/workflows.types'
import type { IApp } from './apps.types'

type ValType = 'docker' | 'cwl' | 'wdl'
type ExportType = {
  label: string
  link?: string
  value: ValType
}
const getConfirmationMessage = (title: ValType) => {
  switch (title) {
    case 'docker': {
      return 'You are about to download a Dockerfile to run this app in a Docker container on your local machine. For more information please consult the app export section in the precisionFDA docs.'
    }
    case 'cwl': {
      return 'You are about to download a CWL Tool package to your local machine. For more information please consult the app export section in the precisionFDA docs.'
    }
    case 'wdl': {
      return 'You are about to download a WDL Task package to your local machine. For more information please consult the app export section in the precisionFDA docs.'
    }
    default: {
      return 'You are about to download a file to your local machine. For more information please consult the app export section in the precisionFDA docs.'
    }
  }
}

const getExportOptions = (resource: ExportToResource, uid?: string): ExportType[] => {
  if (!uid) {
    return []
  }

  const basePath = `/${resource}/${uid}`
  const options: ExportType[] = []

  if (resource === 'apps') {
    options.push({
      label: 'Export to Docker',
      link: `${basePath}/export`,
      value: 'docker',
    })
  }

  options.push(
    {
      label: 'CWL Tool',
      link: `${basePath}/cwl_export`,
      value: 'cwl',
    },
    {
      label: 'WDL Task',
      link: `${basePath}/wdl_export`,
      value: 'wdl',
    },
  )

  return options
}

export type ExportToResource = 'apps' | 'workflows'

export function useExportToModal({ selected, resource }: { selected?: IApp | IWorkflow; resource: ExportToResource }) {
  const { isShown, setShowModal } = useModal()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, ex: ExportType) => {
    if (ex.value) {
      const confirmationMessage = getConfirmationMessage(ex.value)
      if (!window.confirm(confirmationMessage)) {
        e.preventDefault()
      }
    }
  }
  const exportOptions = getExportOptions(resource, selected?.uid)

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent id="modal-export-to" data-testid="modal-export-to" className="gap-4">
        <DialogHeader>
          <DialogTitle>Export to</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto p-1">
          <ul className="m-0 p-0">
            {exportOptions.map(exportOption => (
              <li key={exportOption.label} className="flex list-none text-sm">
                <a
                  className="block flex-1 cursor-pointer rounded-md px-4 py-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  onClick={event => handleClick(event, exportOption)}
                  href={exportOption.link}
                  data-turbolinks="false"
                  download
                >
                  {exportOption.label}
                </a>
              </li>
            ))}
          </ul>
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
