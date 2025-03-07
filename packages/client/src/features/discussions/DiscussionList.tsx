import React, { useMemo } from 'react'
import { Column, UseResizeColumnsState } from 'react-table'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { EmptyTable } from '../../components/Table/styles'
import Table from '../../components/Table/Table'
import { ActionsRow, QuickActions, StyledHomeTable } from '../home/home.styles'
import { ResourceHeader } from '../home/show.styles'
import { HomeScope, KeyVal, MetaV2 } from '../home/types'
import { useList } from '../home/useList'
import { useDiscussionColumns } from './useDiscussionColumns'
import { Discussion } from './discussions.types'
import { fetchDiscussionsRequest } from './api'
import { Button } from '../../components/Button'
import { PlusIcon } from '../../components/icons/PlusIcon'
import { Pagination } from '../../components/Pagination'

const StyledTable = styled(StyledHomeTable)`
  .td:first-child,
  .th:first-child {
    padding: 20px;
  }
`

type ListType = { data: Discussion[]; meta: MetaV2 }

const DiscussionListTable = ({
  discussions,
  homeScope,
  isLoading,
  selectedRows,
  saveColumnResizeWidth,
  saveHiddenColumns,
  colWidths,
}: {
  discussions: Discussion[]
  homeScope?: HomeScope
  selectedRows?: Record<string, boolean>
  isLoading: boolean
  colWidths: KeyVal
  saveHiddenColumns: (cols: string[]) => void
  saveColumnResizeWidth: (columnResizing: UseResizeColumnsState<Discussion>['columnResizing']) => void
}) => {
  function filterColsByScope(c: Column<Discussion>): boolean {
    // Hide 'location' for all homeScopes except 'spaces'.
    return !(homeScope !== 'spaces' && c.accessor === 'scope')
  }

  const col = useDiscussionColumns({ colWidths }).filter(filterColsByScope)
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
  const {
    query,
    selectedIndexes,
    setSelectedIndexes,
    saveColumnResizeWidth,
    colWidths,
    saveHiddenColumns,
    setPerPageParam,
    setPageParam,
  } = useList<ListType>({
    fetchList: fetchDiscussionsRequest,
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
        discussions={query.data?.data ?? []}
        isLoading={query.isLoading}
        selectedRows={selectedIndexes}
        saveHiddenColumns={saveHiddenColumns}
        setSelectedRows={setSelectedIndexes}
        saveColumnResizeWidth={saveColumnResizeWidth}
        colWidths={colWidths}
      />
      <ContentFooter>
        <Pagination
          page={query.data?.meta.page}
          totalCount={query.data?.meta.total}
          totalPages={query.data?.meta.totalPages}
          perPage={query.data?.meta.pageSize}
          isHidden={false}
          setPage={p => setPageParam(p, 'replaceIn')}
          onPerPageSelect={p => setPerPageParam(p, 'replaceIn')}
        />
        <HoverDNAnexusLogo opacity height={14} />
      </ContentFooter>
    </>
  )
}
