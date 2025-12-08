import { Column, Row } from '@tanstack/react-table'
import React from 'react'
import { BaseSelect, BaseSelectOption } from '../../BaseSelect'

export const baseSelectFilterFn = <T,>(row: Row<T>, columnId: string, filterValue: unknown): boolean => {
  const cellValue = row.getValue(columnId)
  return filterValue ? cellValue === filterValue : true
}

interface BaseSelectFilterProps<T> {
  column: Column<T>
  options: BaseSelectOption[]
}

function BaseSelectFilter<T = unknown>({ column, options }: BaseSelectFilterProps<T>) {
  const value = column.getFilterValue() as string | undefined
  
  return (
    <BaseSelect
      options={[{ label: '--', value: '' }, ...options]}
      value={value ?? ''}
      onChange={(newValue) => {
        column.setFilterValue(newValue || undefined)
      }}
      placeholder=""
    />
  )
}

export default BaseSelectFilter
