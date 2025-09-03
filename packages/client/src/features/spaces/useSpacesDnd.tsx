import { DragEndEvent, DragStartEvent, MouseSensor, UniqueIdentifier, useSensor, useSensors } from '@dnd-kit/core'
import { isNumber } from 'lodash'
import { useState } from 'react'
import { isAllowedSpaceGroupType } from './helpers'
import { useAddSpacesToSpaceGroupModal } from './modals/useAddSpacesToSpaceGroupModal'
import { ISpaceV2 } from './spaces.types'

export const useSpaceDnd = ({ selectedObjects }: { selectedObjects: ISpaceV2[] }) => {
  const [draggingRowIds, setDraggingRowIds] = useState<UniqueIdentifier[]>([])
  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 5 } }))
  const dndAddSpacesModal = useAddSpacesToSpaceGroupModal({
    spaces: selectedObjects.filter(s => isAllowedSpaceGroupType(s.type)),
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
      const draggedItem = selectedObjects?.find(item => item.id === active.id)
      const targetSpaceGroup = { id: over?.id }
      if (draggedItem && isNumber(targetSpaceGroup.id)) {
        dndAddSpacesModal.openModal({ id: targetSpaceGroup.id, name: over.data?.current?.name })
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
    dndAddSpacesModal,
  }
}
