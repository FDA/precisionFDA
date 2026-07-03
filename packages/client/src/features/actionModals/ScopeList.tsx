import { useQuery } from '@tanstack/react-query'
import type React from 'react'
import { useState } from 'react'
import { Button } from '@/components/Button'
import { InputText } from '@/components/InputText'
import { FdaRestrictedIcon } from '@/components/icons/FdaRestrictedIcon'
import { HomeIcon } from '@/components/icons/HomeIcon'
import { ProtectedIcon } from '@/components/icons/ProtectedIcon'
import { Table } from '../modal/ModalCheckList'
import { ModalScroll } from '../modal/modal.styles'
import { highlightMatch } from '../spaces/highlightMatch'
import { type EditableSpace, fetchEditableSpacesList } from '../spaces/spaces.api'
import { findSpaceTypeIcon } from '../spaces/useSpacesColumns'
import { ColScopeTitle, ModalSearchBar, ScopeIcon } from './action-modals.styles'
import styles from './ScopeList.module.css'

export const MY_HOME = {
  title: 'My Home',
  scope: 'private',
} as EditableSpace

export const ScopeList = ({ onSelect }: { onSelect: (scope?: EditableSpace) => void }): React.ReactElement => {
  const { data = [], isLoading } = useQuery({
    queryKey: ['editable_spaces_list'],
    queryFn: fetchEditableSpacesList,
  })
  const [selectedScope, setSelectedScope] = useState<string>()
  const [searchQuery, setSearchQuery] = useState<string>('')

  if (isLoading) {
    return <div>Loading...</div>
  }

  const matchesSearch = (name: string, scope: string): boolean => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return name.toLowerCase().includes(q) || scope.toLowerCase().includes(q)
  }

  const scopeList = data.filter(space => matchesSearch(space.name, space.scope))
  const showMyHome = matchesSearch(MY_HOME.title, MY_HOME.scope)

  const handleSelect = (selected: EditableSpace): void => {
    if (selected.scope === selectedScope) {
      setSelectedScope('')
      onSelect(undefined)
    } else {
      setSelectedScope(selected.scope)
      onSelect(selected)
    }
  }

  return (
    <>
      <ModalSearchBar>
        <InputText
          placeholder={'Search by space name or ID...'}
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        />
        <Button type="button" onClick={() => setSearchQuery('')}>
          Clear
        </Button>
      </ModalSearchBar>
      <ModalScroll>
        <Table>
          <thead>
            <tr>
              <th className={styles.headerCell} colSpan={2}>
                All Scopes
              </th>
            </tr>
          </thead>
          <tbody>
            {showMyHome && (
              <tr
                className={`${styles.row} ${selectedScope === MY_HOME.scope ? styles.rowSelected : ''}`}
                key={MY_HOME.scope}
                onClick={() => handleSelect(MY_HOME)}
              >
                <td className={styles.cell}>
                  <ColScopeTitle>
                    <ScopeIcon>
                      <HomeIcon />
                    </ScopeIcon>
                    {highlightMatch(MY_HOME.title, searchQuery)}
                  </ColScopeTitle>
                </td>
                <td className={`${styles.cell} ${styles.scopeId}`}>{highlightMatch(MY_HOME.scope, searchQuery)}</td>
              </tr>
            )}
            {scopeList.map(s => (
              <tr
                key={s.scope}
                className={`${styles.row} ${selectedScope === s.scope ? styles.rowSelected : ''}`}
                onClick={() => handleSelect(s)}
              >
                <td className={styles.cell}>
                  <ColScopeTitle>
                    <ScopeIcon>{findSpaceTypeIcon(s.type)}</ScopeIcon>
                    {s.protected && <ProtectedIcon />}
                    {s.restrictedReviewer && <FdaRestrictedIcon />}
                    {highlightMatch(s.name, searchQuery)}
                  </ColScopeTitle>
                </td>
                <td className={`${styles.cell} ${styles.scopeId}`}>{highlightMatch(s.scope, searchQuery)}</td>
              </tr>
            ))}
            {!showMyHome && scopeList.length === 0 && (
              <tr>
                <td colSpan={2}>
                  <div className={styles.emptyMessage}>No spaces match your search.</div>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </ModalScroll>
    </>
  )
}
