import { ColumnDef } from '@tanstack/react-table'
import React from 'react'
import { TransparentButton } from '../Button'
import { ExpandArrowIcon } from './components/styles'

export function expanderColumnDef<T extends { id: string | number }>(): ColumnDef<T> {
  return {
    id: 'expander',
    header: () => null,
    size: 50,
    enableResizing: false,
    enableHiding: false,
     
    cell: c => {
      return c.row.getCanExpand() ? (
        <TransparentButton
          {...{
            onClick: c.row.getToggleExpandedHandler(),
            style: { cursor: 'pointer', padding: 4 },
          }}
        >
          {c.row.getIsExpanded() ? <ExpandArrowIcon expanded /> : <ExpandArrowIcon />}
        </TransparentButton>
      ) : null
    },
  }
}
