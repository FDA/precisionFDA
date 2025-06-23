import { Column, ColumnDef } from '@tanstack/react-table'
import React from 'react'
import DateTimeRangeFilter, { dateRangeFilterFn } from '../../../components/Table/components/DateTimeRangeFilter'
import SelectFilter, { selectFilterFn } from '../../../components/Table/components/SelectFilter'
import { selectColumnDef } from '../../../components/Table/selectColumnDef'
import { Done, Failed, Runnable, Running } from '../../../components/icons/StateIcons'
import { convertDateToUserTime } from '../../../utils/datetime'
import { Invitation } from '../admin.api'
import { StateLabel } from '../styles'

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
      enableSorting: false,
      meta: {
        filterElement: (column: Column<unknown>) => <DateTimeRangeFilter column={column} />,
      },
      cell: c => <span>{convertDateToUserTime(c.row.original.createdAt).toString()}</span>,
    },
  ] as ColumnDef<Invitation>[]
  return withSelectColumn ? [selectColumnDef<Invitation>(), ...columns] : columns
}
