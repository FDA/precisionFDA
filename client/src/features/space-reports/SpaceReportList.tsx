import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React, { useEffect, useMemo } from 'react'
import { UseResizeColumnsState } from 'react-table'
import { toast } from 'react-toastify'
import useWebSocket from 'react-use-websocket'
import { ButtonSolidBlue } from '../../components/Button'
import Dropdown from '../../components/Dropdown'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { PlusIcon } from '../../components/icons/PlusIcon'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { EmptyTable } from '../../components/Table/styles'
import Table from '../../components/Table/Table'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, getNodeWsUrl } from '../../utils/config'
import { getSelectedObjectsFromIndexes } from '../../utils/object'
import { ActionsDropdownContent } from '../home/ActionDropdownContent'
import { ActionsRow, QuickActions, StyledHomeTable } from '../home/home.styles'
import { ActionsButton } from '../home/show.styles'
import { IFilter, IMeta, KeyVal, Notification, NOTIFICATION_ACTION } from '../home/types'
import { useList } from '../home/useList'
import { ISpaceReport } from './space-report.types'
import { createReport, fetchReports } from './space-reports.api'
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
  saveColumnResizeWidth: (
    columnResizing: UseResizeColumnsState<ISpaceReport>['columnResizing'],
  ) => void
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

export const SpaceReportList =({ spaceId }: { spaceId: number }) => {
  const {
    query,
    selectedIndexes,
    setSelectedIndexes,
    saveColumnResizeWidth,
    colWidths,
    resetSelected,
  } = useList<ListType>({
    fetchList: async (filters: IFilter[], params: { spaceId: string }) => {
      const reports = await fetchReports(params.spaceId)

      return {
        reports,
        meta: {},
      }
    },
    resource: 'space-reports',
    params: { spaceId: String(spaceId) },
  })

  const generate = useMutation({
    mutationKey: ['generate-space-report'],
    mutationFn: createReport,
    onSuccess: async () => {
      await query.refetch()
    },
  })

  const { lastJsonMessage: notification } = useWebSocket<Notification>(getNodeWsUrl(), {
    share: true,
    reconnectInterval: DEFAULT_RECONNECT_INTERVAL,
    reconnectAttempts: DEFAULT_RECONNECT_ATTEMPTS,
    shouldReconnect: () => true,
  })

  useEffect(() => {
    if ([NOTIFICATION_ACTION.SPACE_REPORT_DONE, NOTIFICATION_ACTION.SPACE_REPORT_ERROR].includes(notification?.action)) {
      query.refetch()
    }
  }, [notification])

  const selectedItems = getSelectedObjectsFromIndexes<number, ISpaceReport>(
    selectedIndexes,
    query.data?.reports,
  )

  const actions = userReportSelectActions({
    spaceId,
    selectedItems,
    resetSelected,
  })

  const generateReport = async () => {
    await generate.mutateAsync(spaceId)
      .catch((e: AxiosError<{ error: { message: string } }>) => {
        toast.error(e?.response?.data?.error?.message ?? 'Error creating space reports')
      })
  }

  if (query.status === 'error') return <div>Error! {JSON.stringify(query.error)}</div>

  return (
    <>
      <div>
        <ActionsRow>
          <QuickActions>
            <ButtonSolidBlue
              disabled={query.status === 'loading' || generate.status === 'loading'}
              onClick={generateReport}
            >
              <PlusIcon height={12}/> Generate report
            </ButtonSolidBlue>
          </QuickActions>
          <Dropdown
            trigger="click"
            content={
              <ActionsDropdownContent
                actions={actions}
              />
            }
          >
            {dropdownProps => (
              <ActionsButton
                {...dropdownProps}
                active={dropdownProps.isActive}
              />
            )}
          </Dropdown>
        </ActionsRow>
      </div>

      <SpaceReportListTable
        reports={query.data?.reports ?? []}
        isLoading={query.status === 'loading'}
        selectedRows={selectedIndexes}
        setSelectedRows={setSelectedIndexes}
        saveColumnResizeWidth={saveColumnResizeWidth}
        colWidths={colWidths}
      />

      <ContentFooter>
        <HoverDNAnexusLogo opacity height={14}/>
      </ContentFooter>

      {actions['Delete']?.modal}
    </>
  )
}
