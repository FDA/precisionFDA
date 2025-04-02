import { ColumnDef } from '@tanstack/react-table'
import React from 'react'
import { formatDate } from '../../utils/formatting'
import { ISpaceReport, SpaceReportState } from './space-report.types'

export const reportStateToTextMap: Record<SpaceReportState, string> = {
  CREATED: 'Generating...',
  CLOSING_RESULT_FILE: 'Generating...',
  DONE: 'Done',
  ERROR: 'Error',
}

export const useSpaceReportColumns = (): ColumnDef<ISpaceReport>[] => {
  return [
    {
      header: 'Created',
      accessorKey: 'createdAt',
      enableSorting: false,
      size: 198,
      enableColumnFilter: false,
      cell: c => {
        if (!c.row.original?.createdAt) {
          return ''
        }

        return formatDate(c.row.original?.createdAt)
      },
    },
    {
      header: 'State',
      accessorKey: 'state',
      enableColumnFilter: false,
      enableSorting: false,
      size: 100,
      cell: c => {
        return reportStateToTextMap[c.row.original?.state]
      },
    },
    {
      header: 'Format',
      accessorKey: 'format',
      enableColumnFilter: false,
      enableSorting: false,
      size: 100,
    },
    {
      header: 'File',
      enableColumnFilter: false,
      enableSorting: false,
      size: 150,
      cell: c => {
        if (c.row.original?.state !== 'DONE') {
          return ''
        }

        return (
          <a data-turbolinks="false" href={c.row.original?.resultFile?.links.download}>
            Download
          </a>
        )
      },
    },
  ]
}
