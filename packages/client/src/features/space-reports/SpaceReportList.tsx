import { useQueryClient } from '@tanstack/react-query'
import { ColumnSizingState } from '@tanstack/react-table'
import React, { useEffect } from 'react'
import { Button } from '../../components/Button'
import Menu from '../../components/Menu/Menu'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { ContentFooter } from '../../components/Page/ContentFooter'
import Table from '../../components/Table'
import { StyledPageTable } from '../../components/Table/components/styles'
import { useLastWSNotification } from '../../hooks/useLastWSNotification'
import { getSelectedObjectsFromIndexes } from '../../utils/object'
import { ActionsMenuContent } from '../home/ActionMenuContent'
import { ActionModalsRenderer } from '../home/ActionModalsRenderer'
import { ActionsRow, QuickActions } from '../home/home.styles'
import { ResouceQueryErrorMessage } from '../home/ResouceQueryErrorMessage'
import { ActionsButton, ResourceHeader } from '../home/show.styles'
import { HomeScope, MetaV2, NOTIFICATION_ACTION } from '../home/types'
import { useList } from '../home/useList'
import { Params } from '../home/utils'
import { ISpaceReport } from './space-report.types'
import { fetchReports } from './space-reports.api'
import { useGenerateSpaceReportModal } from './useGenerateSpaceReportModal'
import { useSpaceReportColumns } from './useSpaceReportColumns'
import { userReportSelectActions } from './useSpaceReportSelectActions'
import { SpaceReportIcon } from '../../components/icons/SpaceReportIcon'
import { ActionsMenu } from '../../components/Menu'

type ListType = { reports: ISpaceReport[]; meta: MetaV2 }

const SpaceReportListTable = ({
  reports,
  isLoading,
  selectedRows,
  setSelectedRows,
  columnSizing,
  setColumnSizing,
}: {
  reports: ISpaceReport[]
  selectedRows: Record<string, boolean>
  setSelectedRows: (ids: Record<string, boolean>) => void
  isLoading: boolean
  columnSizing: ColumnSizingState
  setColumnSizing: (columnSizing: ColumnSizingState) => void
}) => {
  const col = useSpaceReportColumns()

  return (
    <StyledPageTable>
      <Table<ISpaceReport>
        isLoading={isLoading}
        data={reports || []}
        columns={col}
        columnSizing={columnSizing}
        setColumnSizing={setColumnSizing}
        rowSelection={selectedRows}
        setSelectedRows={setSelectedRows}
        emptyText="You don't have any reports yet."
        enableColumnFilters={false}
      />
    </StyledPageTable>
  )
}

export const SpaceReportList = ({ scope, isContributorOrHigher }: { scope: string; isContributorOrHigher?: boolean }) => {
  const { query, selectedIndexes, setSelectedIndexes, saveColumnResizeWidth, colWidths, resetSelected } = useList<ListType>({
    fetchList: (_, params: Params) => fetchReports(params.scope as HomeScope).then(reports => ({ reports, meta: {} as MetaV2 })),
    resource: 'space-reports',
    params: { scope },
  })

  const client = useQueryClient()

  const lastJsonMessage = useLastWSNotification([NOTIFICATION_ACTION.SPACE_REPORT_DONE, NOTIFICATION_ACTION.SPACE_REPORT_ERROR])

  useEffect(() => {
    if (lastJsonMessage == null) {
      return
    }
    query.refetch()
    client.invalidateQueries({ queryKey: ['space', scope] })
  }, [lastJsonMessage])

  const selectedItems = getSelectedObjectsFromIndexes<number, ISpaceReport>(selectedIndexes, query.data?.reports)

  const { actions, modals } = userReportSelectActions({
    scope,
    selectedItems,
    resetSelected,
  })

  const { modalComp: generateModal, setShowModal: setGenerateModal } = useGenerateSpaceReportModal({
    scope,
    onClose: () => {
      query.refetch()
    },
  })

  if (query.error) return <ResouceQueryErrorMessage />

  return (
    <>
      <ResourceHeader>
        <ActionsRow>
          <QuickActions>
            {(scope === 'private' || isContributorOrHigher) && (
              <Button data-variant="primary" disabled={query.isLoading} onClick={() => setGenerateModal(true)}>
                <SpaceReportIcon height={14} /> Generate report
              </Button>
            )}
          </QuickActions>
          <ActionsMenu data-testid="space-reports-actions-button">
            <ActionsMenuContent actions={actions} />
          </ActionsMenu>
        </ActionsRow>
      </ResourceHeader>

      <SpaceReportListTable
        reports={query.data?.reports ?? []}
        isLoading={query.isLoading}
        selectedRows={selectedIndexes}
        setSelectedRows={setSelectedIndexes}
        setColumnSizing={saveColumnResizeWidth}
        columnSizing={colWidths}
      />

      <ContentFooter>
        <HoverDNAnexusLogo opacity height={14} />
      </ContentFooter>

      {generateModal}
      <ActionModalsRenderer modals={modals} />
    </>
  )
}
