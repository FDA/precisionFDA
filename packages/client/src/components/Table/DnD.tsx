/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { MouseEvent, TouchEvent } from 'react'
import {
  DragOverlay,
  MouseSensor as LibMouseSensor,
  TouchSensor as LibTouchSensor,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import styled, { css } from 'styled-components'
import { pluralize } from '../../utils/formatting'

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
  as?: string
  children: React.ReactNode
  numSelected?: number
  disabled?: boolean
  style?: Record<string, string>
  name?: string
}
export interface DroppableProps {
  id: number
  name: string
  as?: string
  children: React.ReactNode
  numSelected?: number
  disabled?: boolean
  style?: Record<string, string>
}

const Component = styled.tr<{ $isOver?: boolean }>`
  ${({ $isOver }) =>
    $isOver &&
    css`
      td {
        background-color: var(--highlight-50) !important;
      }
    `}
`

export const Draggable: React.FC<DraggableProps> = ({ as, id, children, style = {}, numSelected = 0, ...rest }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, disabled: numSelected === 0 })

  const dstyle = {
    ...style,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <Component as={as} ref={setNodeRef} {...listeners} {...attributes} {...rest} style={dstyle}>
      {children}
      {isDragging && (
        <td>
          <DragOverlay modifiers={[snapCenterToCursor]}>
            <div style={bubbleOverlayStyle}>
              <div style={bubbleStyle}>
                Moving {numSelected} {pluralize('item', numSelected)}
              </div>
            </div>
          </DragOverlay>
        </td>
      )}
    </Component>
  )
}

export const Droppable: React.FC<DraggableProps> = ({ as, id, name, children, numSelected, ...rest }) => {
  const { setNodeRef, isOver } = useDroppable({ id, data: { name } })

  return (
    <Component as={as} ref={setNodeRef} {...rest} $isOver={isOver}>
      {children}
    </Component>
  )
}
