/* eslint-disable max-classes-per-file */
import React, { MouseEvent, TouchEvent } from 'react'
import {
  MouseSensor as LibMouseSensor,
  TouchSensor as LibTouchSensor,
  useDraggable,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { pluralize } from '../../utils/formatting'

// Block DnD event propagation if element have "data-no-dnd" attribute
const handler = ({ nativeEvent: event }: MouseEvent | TouchEvent) => {
  let cur = event.target as HTMLElement

  while (cur) {
    if (cur.dataset && cur.dataset.noDnd) {
      return false
    }
    cur = cur.parentElement as HTMLElement
  }

  return true
}

export class MouseSensor extends LibMouseSensor {
  static activators = [{ eventName: 'onMouseDown', handler }] as (typeof LibMouseSensor)['activators']
}

export class TouchSensor extends LibTouchSensor {
  static activators = [{ eventName: 'onTouchStart', handler }] as (typeof LibTouchSensor)['activators']
}

const Sortable = ({ id, children, style, ...rest }: DraggableProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      {...rest}
      style={{
        ...style,
        transform: CSS.Transform.toString(transform),
        transition,
        borderTop: isDragging ? '1px solid var(--_table-border-color)' : undefined,
        backgroundColor: isDragging ? 'var(--background)' : undefined,
        opacity: isDragging ? '0.5' : undefined,
      }}
    >
      {children}
    </div>
  )
}

const bubbleOverlayStyle: React.CSSProperties = {
  position: 'relative',
  width: 'fit-content',
  paddingTop: '30px',
}

const bubbleStyle: React.CSSProperties = {
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  color: 'white',
  padding: '5px 10px',
  borderRadius: '8px',
  fontSize: '12px',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
}

export interface DraggableProps {
  id: number
  children: React.ReactNode
  numSelected?: number
  disabled?: boolean
  style?: Record<string, string>
}
export interface DroppableProps {
  id: number
  name: string
  children: React.ReactNode
  numSelected?: number
  disabled?: boolean
  style?: Record<string, string>
}

export const Draggable: React.FC<DraggableProps> = ({ id, children, style = {}, numSelected = 0, ...rest }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, disabled: numSelected === 0 })

  const dstyle = {
    ...style,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} {...rest} style={dstyle}>
      {children}
      {isDragging && (
        <DragOverlay modifiers={[snapCenterToCursor]}>
          <div style={bubbleOverlayStyle}>
            <div style={bubbleStyle}>
              Moving {numSelected} {pluralize('item', numSelected)}
            </div>
          </div>
        </DragOverlay>
      )}
    </div>
  )
}

export const Droppable: React.FC<DraggableProps> = ({ id, name, children, style = {}, numSelected = 0, disabled, ...rest }) => {  
  const { setNodeRef, isOver } = useDroppable({ id, data: { name }})

  const dstyle = {
    ...style,
    backgroundColor: isOver ? 'var(--highlight-100)' : undefined,
  }

  return (
    <div ref={setNodeRef} {...rest} style={dstyle}>
      {children}
    </div>
  )
}
