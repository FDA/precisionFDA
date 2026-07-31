import { type DragEndEvent, MouseSensor, useSensor, useSensors } from '@dnd-kit/core'
import { isNumber } from 'lodash'
import { isAllowedSpaceGroupType } from './helpers'
import { useAddSpacesToSpaceGroupModal } from './modals/useAddSpacesToSpaceGroupModal'
import type { ISpaceV2 } from './spaces.types'

export const useSpaceDnd = ({ selectedObjects }: { selectedObjects: ISpaceV2[] }) => {
  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 5 } }))
  const dndAddSpacesModal = useAddSpacesToSpaceGroupModal({
    spaces: selectedObjects.filter(s => isAllowedSpaceGroupType(s.type)),
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const draggedItem = selectedObjects.find(item => item.id === active.id)
      if (draggedItem && isNumber(over.id)) {
        dndAddSpacesModal.openModal({ id: over.id, name: over.data?.current?.name })
      }
    }
  }

  return {
    sensors,
    handleDragEnd,
    dndAddSpacesModal,
  }
}
