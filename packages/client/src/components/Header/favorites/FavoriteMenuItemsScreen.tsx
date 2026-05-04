import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ReactNode } from 'react'
import { useAuthUser } from '@/features/auth/useAuthUser'
import { cn } from '@/utils/cn'
import { TransparentButton } from '../../Button'
import { StarIcon } from '../../icons/StarIcon'
import { headerIconWrap } from '../header.classes'
import type { SiteNavItemType } from '../NavItems'
import { useUpdateFavoritesMutation } from '../useNavFavorites'
import { useUserSiteNavItems } from '../useUserSiteNavItems'

/** List wrapper — horizontal padding matches modal chrome (1.5rem ≈ px-6) */
const favoriteMenuItemsRoot = 'py-1 px-6'

/** Sortable row container (dnd-kit) */
const favoriteMenuSortableRow = 'flex w-full min-w-0'

/**
 * Row: [icon column — icons right-aligned] [text — left-aligned on one vertical line] [star].
 * Icon column width matches the tallest row so every label starts on the same x.
 */
const favoriteMenuIconColumn = 'flex w-10 shrink-0 items-center justify-end sm:w-11'

const favoriteMenuText = 'min-w-0 flex-1 text-left text-[13px] leading-snug'

const favoriteMenuName = 'flex min-w-0 flex-1 items-center gap-3'

/** Full-row TransparentButton: label block + star column */
const favoriteMenuRowButton = cn(
  'flex w-full min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md border-0 bg-transparent px-1.5 py-1 text-left text-foreground shadow-none outline-none',
  'transition-colors duration-150 ease-out',
  /* TransparentButton sets background:none — important so hover fill wins */
  'hover:!bg-muted/90 dark:hover:!bg-muted/70',
)

/** Star column — favorited: yellow (filled-star affordance) */
const favoriteMenuFavIconWrap = (favorited: boolean) =>
  cn('flex shrink-0 items-center py-1 pl-2 text-muted-foreground', favorited && 'text-yellow-500 dark:text-yellow-400')

const SiteNavItem = (props: { item: SiteNavItemType; onClick: () => void; children: ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.item.id })

  return (
    <div
      ref={setNodeRef}
      className={favoriteMenuSortableRow}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      <TransparentButton className={favoriteMenuRowButton} onClick={props.onClick}>
        {props.children}
      </TransparentButton>
    </div>
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
  const { userSiteNavItems } = useUserSiteNavItems()
  const user = useAuthUser()
  const { mutate: updateFavorites } = useUpdateFavoritesMutation()

  const selFavorites = user?.header_items || []

  const displayList = getAllObjectsByIds(
    selFavorites.map(item => item.name),
    userSiteNavItems,
  )

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
    const over = e.over
    if (!over || e.active.id === over.id) return
    const oldIdx = displayList.findIndex(item => item.id === e.active.id)
    const newIndex = displayList.findIndex(item => item.id === over.id)
    const newLi = arrayMove(displayList, oldIdx, newIndex)
    updateFavorites(
      newLi.map(item => {
        return {
          name: item.id,
          favorite: selFavorites.find(selFavItem => selFavItem.name === item.id && selFavItem.favorite) !== undefined,
        }
      }),
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorder}>
      <SortableContext items={displayList} strategy={verticalListSortingStrategy}>
        <div className={favoriteMenuItemsRoot}>
          {displayList.map(i => {
            const { id, iconHeight, text, icon: Icon } = i
            const isFavorited = selFavorites.find(item => item.name === i.id && item.favorite) !== undefined
            return (
              <SiteNavItem key={id} item={i} onClick={() => handleItemClick(i.id)}>
                <div className={favoriteMenuName}>
                  <div className={favoriteMenuIconColumn}>
                    <div className={headerIconWrap()}>
                      <Icon height={iconHeight} />
                    </div>
                  </div>
                  <div className={favoriteMenuText}>{text}</div>
                </div>
                <div className={favoriteMenuFavIconWrap(isFavorited)} data-testid={`favorite-menu-star-${id}`}>
                  <StarIcon height={15} />
                </div>
              </SiteNavItem>
            )
          })}
        </div>
      </SortableContext>
    </DndContext>
  )
}
