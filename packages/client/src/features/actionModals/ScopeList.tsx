import { useQuery } from '@tanstack/react-query'
import type React from 'react'
import { useState } from 'react'
import { Button } from '@/components/Button'
import { InputText } from '@/components/InputText'
import { HomeIcon } from '@/components/icons/HomeIcon'
import { Col, ColBody, HeaderRow, Table, TableRow } from '../modal/ModalCheckList'
import { ModalScroll } from '../modal/styles'
import { FdaRestrictedIcon } from '../spaces/FdaRestrictedIcon'
import { ProtectedIcon } from '../spaces/ProtectedIcon'
import { type EditableSpace, fetchEditableSpacesList } from '../spaces/spaces.api'
import { findSpaceTypeIcon } from '../spaces/useSpacesColumns'
import { ColScopeTitle, ModalSearchBar, ScopeIcon } from './styles'

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

  const scopeList = data.filter(space => space.name.toLowerCase().includes(searchQuery.toLowerCase()))

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
          placeholder={'Search space...'}
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
            <HeaderRow>
              <Col colSpan={2}>All Scopes</Col>
            </HeaderRow>
          </thead>
          <tbody>
            <TableRow
              $isSelected={selectedScope === MY_HOME.scope}
              key={MY_HOME.scope}
              onClick={() => handleSelect(MY_HOME)}
            >
              <Col>
                <ColScopeTitle>
                  <ScopeIcon>
                    <HomeIcon />
                  </ScopeIcon>
                  {MY_HOME.title}
                </ColScopeTitle>
              </Col>
              <Col>
                <ColBody>{MY_HOME.scope}</ColBody>
              </Col>
            </TableRow>
            {scopeList.map(s => (
              <TableRow $isSelected={selectedScope === s.scope} key={s.scope} onClick={() => handleSelect(s)}>
                <Col>
                  <ColScopeTitle>
                    <ScopeIcon>{findSpaceTypeIcon(s.type)}</ScopeIcon>
                    {s.protected && <ProtectedIcon />}
                    {s.restrictedReviewer && <FdaRestrictedIcon />}
                    {s.name}
                  </ColScopeTitle>
                </Col>
                <Col>
                  <ColBody>{s.scope}</ColBody>
                </Col>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </ModalScroll>
    </>
  )
}
