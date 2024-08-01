import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React, { useEffect } from 'react'
import styled from 'styled-components'

import { TransparentButton } from '../Button'
import { StarIcon } from '../icons/StarIcon'
import { getObjectsByIds } from './orderObjectById'
import { HeaderItemText, IconWrap } from './styles'
import { useNavFavoritesLocalStorage } from './useNavFavoritesLocalStorage'
import { useNavOrderLocalStorage } from './useNavOrderLocalStorage'
import { useUserSiteNavItems } from './useUserSiteNavItems'

export const Name = styled.div`
  display: flex;
  flex-grow: 1;
  gap: 12px;
`
export const Item = styled.div<{ $selected: boolean }>`
  display: flex;
`

const ItemButton = styled(TransparentButton)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  flex-grow: 1;
  &:hover {
    background-color: var(--tertiary-70);
  }

  &.noHover {
    &:hover {
      background-color: initial;
    }
  }

  ${({ $selected }) => $selected && 'background-color: var(--tertiary-70);'}
`

export const FavIconWrap = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px var(--modal-padding-LR);
  align-self: flex-end;

  ${({ $selected }) => $selected && 'color: orange'}
`
export const StyledFavorites = styled.div`
  align-items: center;
  gap: 8px;
  padding: 4px var(--modal-padding-LR);
`

const SiteNavItem = props => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.item.id })

  return (

    <Item
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
      >
      <ItemButton onClick={props.onClick}>
        {props.children}
      </ItemButton>
    </Item>
  )
}

function arraysContainSameValues<T>(array1: T[], array2: T[]): boolean {
  if (array1.length !== array2.length) {
    return false
  }

  const sortedArray1 = array1.slice().sort()
  const sortedArray2 = array2.slice().sort()

  for (let i = 0; i < sortedArray1.length; i++) {
    if (sortedArray1[i] !== sortedArray2[i]) {
      return false
    }
  }

  return true
}

export const FavoriteMenuItemsScreen = () => {
  const { selFavorites, setSelFavorites } = useNavFavoritesLocalStorage()
  const { order, setOrder } = useNavOrderLocalStorage()
  const { userSiteNavItems } = useUserSiteNavItems()
  const userSiteNavItemsIds = userSiteNavItems.map(i => i.id)

  useEffect(() => {
    const validOrder = arraysContainSameValues(order, userSiteNavItemsIds)
    if(!validOrder) {
      setOrder(userSiteNavItemsIds)
    }
  }, [])

  const li = getObjectsByIds(order, userSiteNavItems)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleItemClick = (item: string, position: number) => {
    setSelFavorites(prev => {
      if (prev.includes(item)) {
        return prev.filter(favorite => favorite !== item)
      }
      return [...prev, item]
    })
  }

  const reorder = (e: DragEndEvent) => {
    if (!e.over) return
    if (e.active.id !== e.over.id) {
      setOrder(l => {
        const oldIdx = l.findIndex(item => item === e.active.id)
        const newIndex = l.findIndex(item => item === e.over!.id)
        const newL = arrayMove(l, oldIdx, newIndex)
        return newL
      })
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorder}>
      <SortableContext items={li} strategy={verticalListSortingStrategy}>
        <StyledFavorites>
          {li.map((i, index) => {
            const { id, iconHeight, text, icon: Icon } = i
            return (
              <SiteNavItem key={id} item={i} onClick={() => handleItemClick(i.id, index)}>
                <Name>
                  <IconWrap>
                    <Icon height={iconHeight} />
                  </IconWrap>
                  <HeaderItemText>{text}</HeaderItemText>
                </Name>
                <FavIconWrap $selected={selFavorites.includes(i.id)} data-testid={'favorite-menu-star-'+id}>
                  <StarIcon height={15} />
                </FavIconWrap>
              </SiteNavItem>
            )
          })}
        </StyledFavorites>
      </SortableContext>
    </DndContext>
  )
}
