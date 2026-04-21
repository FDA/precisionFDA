import { useQuery } from '@tanstack/react-query'
import type React from 'react'
import { HomeIcon } from '@/components/icons/HomeIcon'
import { FdaRestrictedIcon } from './FdaRestrictedIcon'
import { ProtectedIcon } from './ProtectedIcon'
import { type EditableSpace, fetchEditableSpacesList } from './spaces.api'
import styles from './spaces.module.css'
import { findSpaceTypeIcon } from './useSpacesColumns'

interface MyHomeProps {
  isSelected: boolean
  onSelect: () => void
}

interface SpaceSelectionListProps {
  excludeScopes?: string[]
  filterString?: string
  selectedScope?: string
  onSelect: (space: EditableSpace) => void
  myHome?: MyHomeProps
}

export const SpaceSelectionList = ({
  excludeScopes = [],
  filterString = '',
  selectedScope,
  onSelect,
  myHome,
}: SpaceSelectionListProps): React.ReactElement => {
  const { data = [], isLoading } = useQuery({
    queryKey: ['editable_spaces_list'],
    queryFn: fetchEditableSpacesList,
  })

  const spaces = data
    .filter(s => !excludeScopes.includes(s.scope))
    .filter(s => !filterString || s.title.toLowerCase().includes(filterString.toLowerCase()))

  if (isLoading) {
    return <div className={styles.spaceSelectionEmptyMessage}>Loading...</div>
  }

  const isEmpty = spaces.length === 0 && !myHome

  if (isEmpty) {
    return <div className={styles.spaceSelectionEmptyMessage}>{filterString ? 'No spaces match your search.' : 'You have no spaces.'}</div>
  }

  return (
    <div className={styles.spaceSelectionList}>
      {myHome && (
        <div
          className={`${styles.spaceSelectionRow} ${myHome.isSelected ? styles.spaceSelectionRowSelected : ''}`}
          onClick={myHome.onSelect}
          role="button"
          tabIndex={0}
          onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && myHome.onSelect()}
        >
          <div className={styles.spaceSelectionNameCell}>
            <span className={styles.spaceSelectionIconWrap}>
              <HomeIcon />
            </span>
            <span className={styles.spaceSelectionTitle}>My Home</span>
          </div>
          <span className={styles.spaceSelectionScopeLabel}>private</span>
        </div>
      )}
      {spaces.map(s => (
        <div
          className={`${styles.spaceSelectionRow} ${selectedScope === s.scope ? styles.spaceSelectionRowSelected : ''}`}
          key={s.scope}
          onClick={() => onSelect(s)}
          role="button"
          tabIndex={0}
          onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && onSelect(s)}
        >
          <div className={styles.spaceSelectionNameCell}>
            <span className={styles.spaceSelectionIconWrap}>{findSpaceTypeIcon(s.type)}</span>
            <span className={styles.spaceSelectionBadges}>
              {s.protected && <ProtectedIcon />}
              {s.restrictedReviewer && <FdaRestrictedIcon />}
            </span>
            <span className={styles.spaceSelectionTitle} title={s.title}>{s.title}</span>
          </div>
          <span className={styles.spaceSelectionScopeLabel}>{s.scope}</span>
        </div>
      ))}
    </div>
  )
}
