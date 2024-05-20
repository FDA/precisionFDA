import React, { useMemo } from 'react'
import { Column } from 'react-table'
import { KeyVal } from '../features/home/types'

export const useStroybookColumns = () =>
  useMemo<Column<any>[]>(
    () =>
      [
        {
          Header: 'Status',
          accessor: 'status',
        },
        {
          Header: 'Name',
          accessor: 'name',
        },
        {
          Header: 'Description',
          accessor: 'description',
        },
        {
          Header: 'Scope',
          accessor: 'scope',
        },
        {
          Header: 'Created',
          accessor: 'created_at_date_time',
        },
      ] as Column<any>[],
    [],
  )
