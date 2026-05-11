import type { Column, Row } from '@tanstack/react-table'
import { cn } from '@/utils/cn'
import { Select } from '../../Select'
import styles from './SelectFilter.module.css'

export type SelectOption = { label: string; option: string | number }

export const selectFilterFn = <T,>(row: Row<T>, columnId: string, filterValue: unknown): boolean => {
  const cellValue = row.getValue(columnId)
  return filterValue ? cellValue === filterValue : true
}

const SelectFilter = <T = unknown>({ column, options }: { column: Column<T>; options: SelectOption[] }) => {
  const v = column.getFilterValue()
  const isActive = v !== undefined && v !== ''

  return (
    <Select
      placeholder=""
      options={[{ label: '--', option: '' }, ...options]}
      value={options.find(o => o.option === v)}
      onChange={(newValue: unknown) => {
        const val = newValue as SelectOption | null
        column.setFilterValue(val == null || val.option === '' ? undefined : val.option)
      }}
      isOptionSelected={(option: unknown) => {
        const o = option as SelectOption
        return o.option === v
      }}
      menuPosition="fixed"
      className={cn(styles.filter, isActive && styles.active)}
    />
  )
}

export default SelectFilter
