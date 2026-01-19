import { ColumnDef } from '@tanstack/react-table'
import React from 'react'
import { ResourceProperties } from '../../features/apps/apps.types'
import { Checkbox } from '../CheckboxNext'

export function selectColumnDef<T extends { id: string | number }>(): ColumnDef<T> {
  return {
    id: 'select',
    header: ({ table }) => (
      <label style={{ cursor: 'pointer' }}>
        <Checkbox
          style={{ boxSizing: 'content-box' }}
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      </label>
    ),
    size: 55,
    minSize: 55,
    maxSize: 55,
    enableResizing: false,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <label style={{ cursor: 'pointer' }} data-testid="row-checkbox">
        <Checkbox
          style={{ boxSizing: 'content-box' }}
          checked={row.getIsSelected()}
          indeterminate={row.getIsSomeSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      </label>
    ),
  }
}

export function propertiesColumnDef<T extends { id: string | number; properties: ResourceProperties }>(
  properties: string[],
): ColumnDef<T>[] {
  return properties.map(
    property =>
      ({
        header: property,
        accessorFn: row => row.properties[property],
        id: `props.${property}`,
        enableColumnFilter: false,
        size: 200,
      }) satisfies ColumnDef<T>,
  )
}
