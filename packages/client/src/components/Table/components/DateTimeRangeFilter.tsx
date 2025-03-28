import { Column, FilterFn } from '@tanstack/react-table'
import React, { useState } from 'react'
import styled from 'styled-components'

export const dateRangeFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  if (!filterValue || !filterValue.from || !filterValue.to) return true

  const cellValue = row.getValue<string>(columnId)
  if (!cellValue) return false

  const cellDate = new Date(cellValue).getTime()
  const fromDate = new Date(filterValue.from).getTime()
  const toDate = new Date(filterValue.to).getTime()

  return cellDate >= fromDate && cellDate <= toDate
}

const DateInput = styled.input`
  min-width: 140px;
  font-size: 14px;
  font-weight: 400;
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
  max-width: 140px;
  margin-right: 4px;
  height: 23px;
`

const DateTimeRangeFilter = ({ column }: { column: Column<unknown> }) => {
  const [filterValue, setFilterValue] = useState<(string|undefined)[]>([])

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
    column.setFilterValue({ from: newFilter[0], to: newFilter[1] })
  }

  return (
    <div>
      <DateInput
        type="date"
        defaultValue={undefined}
        name="from"
        value={filterValue[0] || ''}
        onChange={handleChange}
        placeholder="From"
      />
      <DateInput
        type="date"
        defaultValue={undefined}
        name="to"
        value={filterValue[1] || ''}
        onChange={handleChange}
        placeholder="To"
      />
    </div>
  )
}

export default DateTimeRangeFilter
