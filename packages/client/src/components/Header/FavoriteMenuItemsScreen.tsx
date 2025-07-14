import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React from 'react'
import styled from 'styled-components'

import { TransparentButton } from '../Button'
import { StarIcon } from '../icons/StarIcon'
import { HeaderItemText, IconWrap } from './styles'
import { useNavFavorites } from './useNavFavorites'
import { useUserSiteNavItems } from './useUserSiteNavItems'
import { SiteNavItemType } from './NavItems'

export const Name = styled.div`
  display: flex;
  flex-grow: 1;
  gap: 12px;
`
export const Item = styled.div`
  display: flex;
`

const ItemButton = styled(TransparentButton)<{ $selected?: boolean }>`
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

const SiteNavItem = (props: { item: SiteNavItemType; onClick: () => void; children: React.ReactNode }) => {
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

function getAllObjectsByIds(ids: string[], items: SiteNavItemType[]) {
  const itemMap = Object.fromEntries(items.map(item => [item.id, item]))
  const list = ids.map(id => itemMap[id]).filter(Boolean) as SiteNavItemType[]
  items.forEach(item => {
    if (!list.find(listItem => listItem.id === item.id)) {
      list.push(item)
    }
  })
  return list
}

export const FavoriteMenuItemsScreen = () => {
  const { selFavorites, updateFavorites } = useNavFavorites()
  const { userSiteNavItems } = useUserSiteNavItems()

  const displayList = getAllObjectsByIds(selFavorites.map(item => item.name), userSiteNavItems)

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

  const handleItemClick = (itemId: string) => {
    // New settings is based on "displayList" (because that's what user sees on the screen)
    const newNavSettings = displayList.map(liItem => {
      const currentSettingsItem = selFavorites.find(item => item.name === liItem.id)

      let favorite = false
      if (liItem.id === itemId) {
        favorite = currentSettingsItem ? !currentSettingsItem.favorite : true
      } else if (currentSettingsItem) {
        favorite = currentSettingsItem.favorite
      }

      return { name: liItem.id, favorite }
    })
    updateFavorites(newNavSettings)
  }

  const reorder = (e: DragEndEvent) => {
    if (!e.over) return
    if (e.active.id !== e.over.id) {
      const oldIdx = displayList.findIndex(item => item.id === e.active.id)
      const newIndex = displayList.findIndex(item => item.id === e.over!.id)
      const newLi = arrayMove(displayList, oldIdx, newIndex)
      updateFavorites(newLi.map(item => {return { name: item.id, favorite: selFavorites.find(selFavItem => selFavItem.name === item.id && selFavItem.favorite) !== undefined }}))
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorder}>
      <SortableContext items={displayList} strategy={verticalListSortingStrategy}>
        <StyledFavorites>
          {displayList.map((i) => {
            const { id, iconHeight, text, icon: Icon } = i
            return (
              <SiteNavItem key={id} item={i} onClick={() => handleItemClick(i.id)}>
                <Name>
                  <IconWrap>
                    <Icon height={iconHeight} />
                  </IconWrap>
                  <HeaderItemText>{text}</HeaderItemText>
                </Name>
                <FavIconWrap $selected={selFavorites.find(item => item.name === i.id && item.favorite) !== undefined} data-testid={`favorite-menu-star-${id}`}>
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
