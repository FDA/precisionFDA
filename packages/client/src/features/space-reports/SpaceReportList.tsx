import { useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useMemo } from 'react'
import { UseResizeColumnsState } from 'react-table'
import useWebSocket from 'react-use-websocket'
import { Button } from '../../components/Button'
import Dropdown from '../../components/Dropdown'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { PlusIcon } from '../../components/icons/PlusIcon'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { EmptyTable } from '../../components/Table/styles'
import Table from '../../components/Table/Table'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, getNodeWsUrl, SHOULD_RECONNECT } from '../../utils/config'
import { getSelectedObjectsFromIndexes } from '../../utils/object'
import { ActionsDropdownContent } from '../home/ActionDropdownContent'
import { ActionsRow, QuickActions, StyledHomeTable } from '../home/home.styles'
import { ActionsButton, ResourceHeader } from '../home/show.styles'
import { IFilter, IMeta, KeyVal, Notification, NOTIFICATION_ACTION, WEBSOCKET_MESSSAGE_TYPE, WebSocketMessage } from '../home/types'
import { useList } from '../home/useList'
import { ISpaceReport } from './space-report.types'
import { fetchReports } from './space-reports.api'
import { useGenerateSpaceReportModal } from './useGenerateSpaceReportModal'
import { useSpaceReportColumns } from './useSpaceReportColumns'
import { userReportSelectActions } from './useSpaceReportSelectActions'

type ListType = { reports: ISpaceReport[]; meta: IMeta }

const SpaceReportListTable = ({
  reports,
  isLoading,
  selectedRows,
  setSelectedRows,
  saveColumnResizeWidth,
  colWidths,
}: {
  reports: ISpaceReport[]
  selectedRows?: Record<string, boolean>
  setSelectedRows: (ids: Record<string, boolean>) => void
  isLoading: boolean
  colWidths: KeyVal
  saveColumnResizeWidth: (columnResizing: UseResizeColumnsState<ISpaceReport>['columnResizing']) => void
}) => {
  const col = useSpaceReportColumns({ colWidths })
  const columns = useMemo(() => col, [col])
  const data = useMemo(() => reports || [], [reports])

  return (
    <StyledHomeTable>
      <Table<ISpaceReport>
        name="spaceReports"
        columns={columns}
        data={data}
        isSelectable
        loading={isLoading}
        loadingComponent={<div>Loading...</div>}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        emptyComponent={<EmptyTable>You have no reports here.</EmptyTable>}
        isColsResizable
        saveColumnResizeWidth={saveColumnResizeWidth}
      />
    </StyledHomeTable>
  )
}

export const SpaceReportList = ({ scope }: { scope: string }) => {
  const { query, selectedIndexes, setSelectedIndexes, saveColumnResizeWidth, colWidths, resetSelected } = useList<ListType>({
    fetchList: async (filters: IFilter[], params: { scope: string }) => {
      const reports = await fetchReports(params.scope)

      return {
        reports,
        meta: {},
      }
    },
    resource: 'space-reports',
    params: { scope },
  })

  const client = useQueryClient()

  const { lastJsonMessage } = useWebSocket<WebSocketMessage>(getNodeWsUrl(), {
    share: true,
    reconnectInterval: DEFAULT_RECONNECT_INTERVAL,
    reconnectAttempts: DEFAULT_RECONNECT_ATTEMPTS,
    shouldReconnect: () => SHOULD_RECONNECT,
    filter: message => {
      try {
        const messageData = JSON.parse(message.data)
        return messageData.type === WEBSOCKET_MESSSAGE_TYPE.NOTIFICATION
      } catch (e) {
        return false
      }
    },
  })

  useEffect(() => {
    const notification = lastJsonMessage?.data as Notification
    if ([NOTIFICATION_ACTION.SPACE_REPORT_DONE, NOTIFICATION_ACTION.SPACE_REPORT_ERROR].includes(notification?.action)) {
      query.refetch()
    }
    client.invalidateQueries({ queryKey: ['space', scope] })
  }, [lastJsonMessage])

  const selectedItems = getSelectedObjectsFromIndexes<number, ISpaceReport>(selectedIndexes, query.data?.reports)

  const actions = userReportSelectActions({
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

  if (query.error) return <div>Error! {JSON.stringify(query.error)}</div>

  return (
    <>
      <ResourceHeader>
        <ActionsRow>
          <QuickActions>
            <Button data-variant="primary" disabled={query.isLoading} onClick={() => setGenerateModal(true)}>
              <PlusIcon height={12} /> Generate report
            </Button>
          </QuickActions>
          <Dropdown trigger="click" content={<ActionsDropdownContent actions={actions} />}>
            {dropdownProps => <ActionsButton {...dropdownProps} active={dropdownProps.isActive} />}
          </Dropdown>
        </ActionsRow>
      </ResourceHeader>

      <SpaceReportListTable
        reports={query.data?.reports ?? []}
        isLoading={query.isLoading}
        selectedRows={selectedIndexes}
        setSelectedRows={setSelectedIndexes}
        saveColumnResizeWidth={saveColumnResizeWidth}
        colWidths={colWidths}
      />

      <ContentFooter>
        <HoverDNAnexusLogo opacity height={14} />
      </ContentFooter>

      {actions['Delete']?.modal}
      {generateModal}
    </>
  )
}
