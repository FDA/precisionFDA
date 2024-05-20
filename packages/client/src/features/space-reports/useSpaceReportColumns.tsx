import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Column } from 'react-table'
import { formatDate } from '../../utils/formatting'
import { KeyVal } from '../home/types'
import { ISpaceReport, SpaceReportState } from './space-report.types'

export const reportStateToTextMap: Record<SpaceReportState, string> = {
  CREATED: 'Generating...',
  CLOSING_RESULT_FILE: 'Generating...',
  DONE: 'Done',
  ERROR: 'Error',
}

export const useSpaceReportColumns = ({
  colWidths,
}: {
  colWidths?: KeyVal
}) => {
  const location = useLocation()
  return useMemo<Column<ISpaceReport>[]>(
    () =>
      [
        {
          Header: 'Created',
          accessor: 'createdAt',
          disableSortBy: true,
          width: colWidths?.created_at_date_time || 198,
          disableFilters: true,
          Cell({ value }) {
            if (!value) {
              return ''
            }

            return formatDate(value)
          },
        },
        {
          Header: 'State',
          accessor: 'state',
          disableFilters: true,
          disableSortBy: true,
          width: colWidths?.state || 100,
          Cell({ value }) {
            return reportStateToTextMap[value]
          },
        },
        {
          Header: 'Format',
          accessor: 'format',
          disableFilters: true,
          disableSortBy: true,
          width: colWidths?.format || 100,
        },
        {
          Header: 'File',
          accessor: 'resultFile',
          disableFilters: true,
          disableSortBy: true,
          width: colWidths?.location || 150,
          Cell({ value }) {
            if (value?.state !== 'closed') {
              return ''
            }

            return (
              <a
                data-turbolinks="false"
                href={value.links.download}
              >
                Download
              </a>
            )
          },
        },
      ] as Column<ISpaceReport>[],
    [location.search],
  )
}
