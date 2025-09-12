import { DragEndEvent, DragStartEvent, MouseSensor, UniqueIdentifier, useSensor, useSensors } from '@dnd-kit/core'
import { isNumber } from 'lodash'
import { useState } from 'react'
import { useDnDMoveFileModal } from './actionModals/useDnDMoveFileModal'
import { IFile } from './files.types'

export const useFileDnd = ({ setSelectedRows, selectedObjects, files, spaceId }: { files?: IFile[], setSelectedRows: (ids: Record<string, boolean>) => void, selectedObjects: IFile[], spaceId?: number }) => {
  const [draggingRowIds, setDraggingRowIds] = useState<UniqueIdentifier[]>([])
  const sensors = useSensors( useSensor(MouseSensor, { activationConstraint: { distance: 5 }}))
  const dndMoveModal = useDnDMoveFileModal({
    spaceId,
    selected: selectedObjects,
    onSuccess: () => {
      setDraggingRowIds([])
      setSelectedRows({})
    },
    onCanceled: () => setDraggingRowIds([]),
  })

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const sr = selectedObjects.map(i => i.id)
    
    if (sr.includes(active.id as number)) {
      setDraggingRowIds(sr)
    } else {
      setDraggingRowIds([active.id])
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id && over) {
      const draggedItem = files?.find((item) => item.id === active.id)
      const targetFolder = { id: over?.id }
      if (draggedItem && isNumber(targetFolder.id)) {
        dndMoveModal.openModal({ id: targetFolder?.id, name: over.data?.current?.name })
      }
    } else {
      setDraggingRowIds([])
    }
  }

  return {
    draggingRowIds,
    sensors,
    handleDragStart,
    handleDragEnd,
    dndMoveModal,
  }
}
