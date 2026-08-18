import type React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getSpaceIdFromScope } from '@/utils'
import type { IApp } from '../apps/apps.types'
import { getBaseLink } from '../apps/run/utils'
import { useModal } from '../modal/useModal'
import type { EditableSpace } from '../spaces/spaces.api'
import { ScopeList } from './ScopeList'

export const useForkAppToModal = ({ selectedApp }: { selectedApp?: IApp }) => {
  const { isShown, setShowModal } = useModal()
  const navigate = useNavigate()
  const [selectedTarget, setSelectedTarget] = useState<EditableSpace>()
  const sourceScope = selectedApp?.scope
  const spaceId = getSpaceIdFromScope(sourceScope)

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setShowModal(false)
    navigate(`/${getBaseLink(spaceId)}/apps/${selectedApp?.uid}/fork`, {
      state: {
        targetScope: selectedTarget?.scope,
        targetName: selectedTarget?.title,
      },
    })
  }

  const modalComp = (
    <Dialog open={Boolean(isShown)} onOpenChange={setShowModal}>
      <DialogContent id="fork-app-to-modal" data-testid="fork-app-to-modal" variant="medium" className="gap-4">
        <DialogHeader>
          <DialogTitle>Fork App To</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 py-1">
          <ScopeList onSelect={setSelectedTarget} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!selectedTarget} onClick={handleSubmit}>
            Fork
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
