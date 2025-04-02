import { Column, FilterFn } from '@tanstack/react-table'
import React, { useState } from 'react'
import styled from 'styled-components'


export const numberRangeFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  if (!filterValue || (filterValue.from === '' && filterValue.to === '')) {
    return true
  }

  const cellValue = row.getValue<string | number>(columnId)
  if (cellValue == null) return false

  const numericCellValue = typeof cellValue === 'number' ? cellValue : parseFloat(cellValue)
  if (Number.isNaN(numericCellValue)) return false

  const from = filterValue.from !== '' ? parseFloat(filterValue.from) : null
  const to = filterValue.to !== '' ? parseFloat(filterValue.to) : null

  if (from !== null && to === null) {
    return numericCellValue >= from
  }
  if (from === null && to !== null) {
    return numericCellValue <= to
  }
  if (from !== null && to !== null) {
    return numericCellValue >= from && numericCellValue <= to
  }

  return true
}

const NumberInput = styled.input`
  min-width: 60px;
  font-size: 14px;
  font-weight: 400;
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
  max-width: 80px;
  margin-right: 4px;
  height: 23px;
`

function NumberRangeFilter<T>({ column, fromPlaceholder, toPlaceholder }: { column: Column<T>, fromPlaceholder: string, toPlaceholder: string }) {
  const [filterValue, setFilterValue] = useState({ from: null, to: null })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const nValue = value === '' ? null : value
    const newFilter = { ...filterValue, [name]: nValue }
    setFilterValue(newFilter)
    column.setFilterValue(newFilter)
  }

  return (
    <div>
      <NumberInput
        type="number"
        name="from"
        value={filterValue.from || ''}
        onChange={handleChange}
        placeholder={fromPlaceholder}
      />
      <NumberInput
        type="number"
        name="to"
        value={filterValue.to || ''}
        onChange={handleChange}
        placeholder={toPlaceholder}
      />
    </div>
  )
}

export default NumberRangeFilter
