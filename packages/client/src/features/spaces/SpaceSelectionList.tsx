import { useQuery } from '@tanstack/react-query'
import type React from 'react'
import { FdaRestrictedIcon } from '@/components/icons/FdaRestrictedIcon'
import { HomeIcon } from '@/components/icons/HomeIcon'
import { ProtectedIcon } from '@/components/icons/ProtectedIcon'
import { cn } from '@/utils/cn'
import { SpaceTypeName } from './common'
import { highlightMatch } from './highlightMatch'
import { type EditableSpace, fetchEditableSpacesList } from './spaces.api'
import { findSpaceTypeIcon } from './useSpacesColumns'

const spaceSelectionRowClass = (isSelected: boolean) =>
  cn(
    'flex w-full min-w-0 cursor-pointer items-center gap-2 border-x-0 border-t-0 border-b border-l-2 border-border border-l-transparent bg-background px-3 py-2 text-left font-sans text-foreground transition-colors last:border-b-0 hover:bg-muted/50',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30',
    isSelected && 'border-l-primary bg-primary/15 hover:bg-primary/20 dark:bg-primary/25 dark:hover:bg-primary/30',
  )

const spaceSelectionMainClass =
  'flex min-w-0 flex-1 flex-col items-start gap-0.5 @md/space-list:flex-row @md/space-list:items-center @md/space-list:justify-between @md/space-list:gap-3'

const spaceNameClass = 'min-w-0 max-w-full flex-1 truncate text-sm font-medium text-foreground'

const metaGroupClass = 'flex max-w-full shrink-0 flex-wrap items-center gap-1.5'

const metaPillBaseClass = 'shrink-0 rounded border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap shadow-xs'

const scopePillClass = cn(metaPillBaseClass, 'border-border bg-muted font-mono text-muted-foreground dark:bg-muted/70')

/** Matches SpaceTypeTabs / --area-* tokens: shared = green, private = purple. */
const typePillClass = (area: 'private' | 'shared') =>
  cn(
    metaPillBaseClass,
    area === 'private'
      ? '[background:var(--area-private-gradient)] border-[var(--area-private-border)] text-[oklch(97%_0.03_308.12)]'
      : '[background:var(--area-shared-gradient)] border-[var(--area-shared-border)] text-[oklch(97%_0.03_155.65)]',
  )

type SpaceTypeMeta = { label: string; area: 'private' | 'shared' }

const spaceTypeMeta = (space: Pick<EditableSpace, 'type' | 'title'>): SpaceTypeMeta => {
  if (space.type === 'private_type') {
    return { label: SpaceTypeName.private_type, area: 'private' }
  }
  if (space.type === 'review') {
    const isPrivateReview = space.title.toLowerCase().includes('private review')
    return {
      label: isPrivateReview ? 'Private Review' : 'Shared Review',
      area: isPrivateReview ? 'private' : 'shared',
    }
  }
  return {
    label: SpaceTypeName[space.type as keyof typeof SpaceTypeName] ?? space.type,
    area: 'shared',
  }
}

const MY_HOME_TITLE = 'My Home'
const MY_HOME_SCOPE = 'private'

const MY_HOME: EditableSpace = {
  name: MY_HOME_TITLE,
  title: MY_HOME_TITLE,
  scope: MY_HOME_SCOPE,
  type: 'private_type',
  protected: false,
  restrictedReviewer: false,
}

interface SpaceSelectionListProps {
  excludeScopes?: string[]
  filterString?: string
  selectedScope?: string
  onSelect: (space: EditableSpace) => void
  includeMyHome?: boolean
}

export const SpaceSelectionList = ({
  excludeScopes = [],
  filterString = '',
  selectedScope,
  onSelect,
  includeMyHome = false,
}: SpaceSelectionListProps): React.ReactElement => {
  const { data = [], isLoading } = useQuery({
    queryKey: ['editable_spaces_list'],
    queryFn: fetchEditableSpacesList,
  })

  const spaces = data
    .filter(s => !excludeScopes.includes(s.scope))
    .filter(s => {
      if (!filterString) return true
      const q = filterString.toLowerCase()
      const { label: typeLabel } = spaceTypeMeta(s)
      return (
        s.name.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.scope.toLowerCase().includes(q) ||
        typeLabel.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q)
      )
    })
  const query = filterString.toLowerCase()
  const showMyHome =
    includeMyHome &&
    !excludeScopes.includes(MY_HOME_SCOPE) &&
    (!query || MY_HOME_TITLE.toLowerCase().includes(query) || MY_HOME_SCOPE.includes(query))

  if (isLoading) {
    return <div className="px-3 py-4 text-sm text-muted-foreground">Loading...</div>
  }

  const isEmpty = spaces.length === 0 && !showMyHome

  if (isEmpty) {
    return (
      <div className="px-3 py-4 text-sm text-muted-foreground">
        {filterString ? 'No spaces match your search.' : 'You have no spaces.'}
      </div>
    )
  }

  return (
    <div className="@container/space-list w-full min-w-0 rounded-md border border-border bg-background shadow-xs">
      {showMyHome && (
        <button
          type="button"
          className={spaceSelectionRowClass(selectedScope === MY_HOME_SCOPE)}
          onClick={() => onSelect(MY_HOME)}
        >
          <span className="flex w-6 shrink-0 items-center justify-center text-muted-foreground">
            <HomeIcon />
          </span>
          <div className={spaceSelectionMainClass}>
            <span className={spaceNameClass}>{highlightMatch(MY_HOME_TITLE, filterString)}</span>
            <span className={metaGroupClass}>
              <span className={typePillClass('private')}>{spaceTypeMeta(MY_HOME).label}</span>
              <span className={scopePillClass}>{highlightMatch(MY_HOME_SCOPE, filterString)}</span>
            </span>
          </div>
        </button>
      )}
      {spaces.map(s => {
        const { label: typeLabel, area } = spaceTypeMeta(s)
        return (
          <button
            type="button"
            className={spaceSelectionRowClass(selectedScope === s.scope)}
            key={s.scope}
            onClick={() => onSelect(s)}
          >
            <span className="flex w-6 shrink-0 items-center justify-center text-muted-foreground">
              {findSpaceTypeIcon(s.type)}
            </span>
            {(s.protected || s.restrictedReviewer) && (
              <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
                {s.protected && <ProtectedIcon />}
                {s.restrictedReviewer && <FdaRestrictedIcon />}
              </span>
            )}
            <div className={spaceSelectionMainClass}>
              <span className={spaceNameClass} title={s.name}>
                {highlightMatch(s.name, filterString)}
              </span>
              <span className={metaGroupClass}>
                <span className={typePillClass(area)} title={typeLabel}>
                  {highlightMatch(typeLabel, filterString)}
                </span>
                <span className={scopePillClass} title={s.scope}>
                  {highlightMatch(s.scope, filterString)}
                </span>
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
