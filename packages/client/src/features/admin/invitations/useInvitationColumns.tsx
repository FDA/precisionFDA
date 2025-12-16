import { Column, ColumnDef } from '@tanstack/react-table'
import React from 'react'
import DateTimeRangeFilter, { dateRangeFilterFn } from '../../../components/Table/components/DateTimeRangeFilter'
import SelectFilter, { selectFilterFn } from '../../../components/Table/components/SelectFilter'
import { selectColumnDef } from '../../../components/Table/selectColumnDef'
import { Done, Failed, Runnable, Running } from '../../../components/icons/StateIcons'
import { convertDateToUserTime } from '../../../utils/datetime'
import { StateLabel } from '../styles'
import { Invitation } from '../users/api'

export const ProvisionStateCell = ({ provisionState }: { provisionState: string }) => {
  const icon = {
    finished: <Done />,
    failed: <Failed />,
    in_progress: <Running />,
    pending: <Runnable />,
  } as Record<string, React.ReactNode>
  const label = {
    finished: 'Finished',
    failed: 'Failed',
    in_progress: 'In Progress',
    pending: 'Pending',
  } as Record<string, string>
  return (
    <StateLabel>
      {icon[provisionState]}
      {label[provisionState]}
    </StateLabel>
  )
}

export const useInvitationColumns = (withSelectColumn: boolean): ColumnDef<Invitation>[] => {
  const columns = [
    {
      header: 'First Name',
      accessorKey: 'firstName',
      filterFn: 'includesString',
      enableSorting: false,
    },
    {
      header: 'Last Name',
      accessorKey: 'lastName',
      filterFn: 'includesString',
      enableSorting: false,
    },
    {
      header: 'Email',
      accessorKey: 'email',
      filterFn: 'includesString',
      enableSorting: false,
    },
    {
      header: 'Provisioning State',
      accessorKey: 'provisioningState',
      filterFn: selectFilterFn,
      enableSorting: false,
      meta: {
        filterElement: (column: Column<Invitation>) => (
          <SelectFilter
            column={column}
            options={[
              { label: 'Pending', option: 'pending' },
              { label: 'In Progress', option: 'in_progress' },
              { label: 'Finished', option: 'finished' },
              { label: 'Failed', option: 'failed' },
            ]}
          />
        ),
      },
      cell: props => <ProvisionStateCell provisionState={props.row.original.provisioningState} />,
    },
    {
      header: 'DUNS',
      accessorKey: 'duns',
      enableColumnFilter: false,
      enableSorting: false,
    },
    {
      header: 'Requested At',
      accessorKey: 'createdAt',
      filterFn: dateRangeFilterFn,
      minSize: 400,
      enableSorting: false,
      meta: {
        filterElement: (column: Column<unknown>) => <DateTimeRangeFilter column={column} />,
      },
      cell: c => <span>{convertDateToUserTime(c.row.original.createdAt).toString()}</span>,
    },
    {
      header: 'Reason/Goals',
      accessorKey: 'extras.req_reason',
      enableColumnFilter: false,
      enableSorting: false,
    },
    {
      header: 'Contribution Data',
      accessorKey: 'extras.req_data',
      enableColumnFilter: false,
      enableSorting: false,
    },
    {
      header: 'Contribution Software',
      accessorKey: 'extras.req_software',
      enableColumnFilter: false,
      enableSorting: false,
    },
    {
      header: 'Challenge Participation Intent',
      accessorKey: 'extras.participate_intent',
      enableColumnFilter: false,
      enableSorting: false,
      cell: c => (c.row.original.extras.participate_intent ? 'Yes' : 'No'),
    },
    {
      header: 'Challenge Organization Intent',
      accessorKey: 'extras.organize_intent',
      enableColumnFilter: false,
      enableSorting: false,
      cell: c => (c.row.original.extras.organize_intent ? 'Yes' : 'No'),
    },
    {
      header: 'Research Intent',
      accessorKey: 'extras.research_intent',
      enableColumnFilter: false,
      enableSorting: false,
      cell: c => (c.row.original.extras.research_intent ? 'Yes' : 'No'),
    },
    {
      header: 'Clinical Intent',
      accessorKey: 'extras.clinical_intent',
      enableColumnFilter: false,
      enableSorting: false,
      cell: c => (c.row.original.extras.clinical_intent ? 'Yes' : 'No'),
    },
  ] as ColumnDef<Invitation>[]
  return withSelectColumn ? [selectColumnDef<Invitation>(), ...columns] : columns
}
