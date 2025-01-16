import React, { useMemo } from 'react'
import { Column, UseResizeColumnsState } from 'react-table'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { EmptyTable } from '../../components/Table/styles'
import Table from '../../components/Table/Table'
import { ActionsRow, QuickActions, StyledHomeTable } from '../home/home.styles'
import { ResourceHeader } from '../home/show.styles'
import { HomeScope, IFilter, IMeta, KeyVal } from '../home/types'
import { useList } from '../home/useList'
import { useDiscussionColumns } from './useDiscussionColumns'
import { Discussion } from './discussions.types'
import { fetchDiscussionsRequest } from './api'
import { Button } from '../../components/Button'
import { PlusIcon } from '../../components/icons/PlusIcon'
import { getSpaceIdFromScope } from '../../utils'

const StyledTable = styled(StyledHomeTable)`
  .td:first-child,
  .th:first-child {
    padding: 20px;
  }
`

type ListType = { discussions: Discussion[]; meta: IMeta }

const DiscussionListTable = ({
  discussions,
  homeScope,
  isLoading,
  selectedRows,
  setSelectedRows,
  saveColumnResizeWidth,
  saveHiddenColumns,
  colWidths,
}: {
  discussions: Discussion[]
  homeScope?: HomeScope
  selectedRows?: Record<string, boolean>
  setSelectedRows: (ids: Record<string, boolean>) => void
  isLoading: boolean
  colWidths: KeyVal
  saveHiddenColumns: (cols: string[]) => void
  saveColumnResizeWidth: (columnResizing: UseResizeColumnsState<Discussion>['columnResizing']) => void
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const onClick = (discussion: Discussion) => {
    const spaceId = getSpaceIdFromScope(discussion.note.scope)

    if (spaceId) {
      navigate(`/spaces/${spaceId}/discussions/${discussion.id}`, {
        state: {
          from: location.pathname,
          fromSearch: location.search,
        },
      })
    } else {
      window.location.replace(`/discussions/${discussion.id}`)
    }
  }

  function filterColsByScope(c: Column<Discussion>): boolean {
    // Hide 'location' for all homeScopes except 'spaces'.
    return !(homeScope !== 'spaces' && c.accessor === 'note.scope')
  }

  const col = useDiscussionColumns({ colWidths, onClick }).filter(filterColsByScope)
  const columns = useMemo(() => col, [col])
  const data = useMemo(() => discussions || [], [discussions, selectedRows])

  return (
    <StyledTable>
      <Table<Discussion>
        name="discussions"
        columns={columns}
        data={data}
        saveHiddenColumns={saveHiddenColumns}
        loading={isLoading}
        loadingComponent={<div>Loading...</div>}
        emptyComponent={<EmptyTable>No one has started a discussion yet.</EmptyTable>}
        isColsResizable
        saveColumnResizeWidth={saveColumnResizeWidth}
      />
    </StyledTable>
  )
}

export const DiscussionList = ({ scope, canCreateDiscussion }: { scope: HomeScope; canCreateDiscussion?: boolean }) => {
  const { query, selectedIndexes, setSelectedIndexes, saveColumnResizeWidth, colWidths, saveHiddenColumns } = useList<ListType>({
    fetchList: async (filters: IFilter[], params: { scope: string }) => {
      return fetchDiscussionsRequest(params.scope)
    },
    resource: 'discussions',
    params: { scope },
  })

  const location = useLocation()

  if (query.error) return <div>Error! {JSON.stringify(query.error)}</div>

  return (
    <>
      <ResourceHeader>
        <ActionsRow>
          <QuickActions>
            {canCreateDiscussion && (
              <Button
                data-variant="primary"
                data-turbolinks="false"
                data-testid="space-discussion-create-link"
                as={Link}
                to={`${location.pathname}/create`}
              >
                <PlusIcon height={12} /> Start a Discussion
              </Button>
            )}
          </QuickActions>
        </ActionsRow>
      </ResourceHeader>
      <DiscussionListTable
        homeScope={scope}
        discussions={query.data ?? []}
        isLoading={query.isLoading}
        selectedRows={selectedIndexes}
        saveHiddenColumns={saveHiddenColumns}
        setSelectedRows={setSelectedIndexes}
        saveColumnResizeWidth={saveColumnResizeWidth}
        colWidths={colWidths}
      />
      <ContentFooter>
        <HoverDNAnexusLogo opacity height={14} />
      </ContentFooter>
    </>
  )
}
