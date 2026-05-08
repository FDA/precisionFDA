import type { Column, Row } from '@tanstack/react-table'
import type React from 'react'
import { useState } from 'react'
import { cn } from '@/utils/cn'
import styles from './DateTimeRangeFilter.module.css'

export const dateRangeFilterFn = <T,>(row: Row<T>, columnId: string, filterValue: unknown): boolean => {
  const filter = filterValue as { from?: string; to?: string } | undefined | null
  if (!filter?.from || !filter.to) return true

  const cellValue = row.getValue<string>(columnId)
  if (!cellValue) return false

  const cellDate = new Date(cellValue).getTime()
  const fromDate = new Date(filter.from).getTime()
  const toDate = new Date(filter.to).getTime()

  return cellDate >= fromDate && cellDate <= toDate
}

const DateTimeRangeFilter = <T,>({ column }: { column: Column<T> }) => {
  const filteredValue = column.getFilterValue() as [string | undefined, string | undefined] | undefined
  const [filterValue, setFilterValue] = useState<(string | undefined)[]>(filteredValue ?? ['', ''])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const uvalue = value === '' ? undefined : value
    const newFilter = [...filterValue]

    if (name === 'from') {
      newFilter[0] = uvalue
    }
    if (name === 'to') {
      newFilter[1] = uvalue
    }

    setFilterValue(newFilter)
    column.setFilterValue([...newFilter])
  }

  return (
    <div className={styles.range}>
      <input
        type="date"
        className={cn(styles.input, filterValue[0] && styles.active)}
        name="from"
        value={filterValue[0] || ''}
        onChange={handleChange}
        placeholder="From"
      />
      <input
        type="date"
        className={cn(styles.input, filterValue[1] && styles.active)}
        name="to"
        value={filterValue[1] || ''}
        onChange={handleChange}
        placeholder="To"
      />
    </div>
  )
}

export default DateTimeRangeFilter
