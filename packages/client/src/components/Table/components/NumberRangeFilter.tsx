import { Column, FilterFnOption } from '@tanstack/react-table'
import React from 'react'
import styled from 'styled-components'
import DebouncedInput from './DebouncedInput'

type NumberRangeFilterValue = { from: string | number | null; to: string | number | null }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const numberRangeFilterFn: FilterFnOption<any> = (row, columnId, filterValue) => {
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

const NumberInputWrapper = styled.div`
  display: inline-block;
  margin-right: 4px;

  input {
    min-width: 60px;
    font-size: 14px;
    font-weight: 400;
    padding: 4px;
    border: 1px solid #ccc;
    border-radius: 4px;
    max-width: 80px;
    height: 23px;
  }
`

function NumberRangeFilter<T>({ column, fromPlaceholder, toPlaceholder }: { column: Column<T>, fromPlaceholder: string, toPlaceholder: string }) {
  const filterValue = (column.getFilterValue() as NumberRangeFilterValue) ?? { from: null, to: null }

  return (
    <div>
      <NumberInputWrapper>
        <DebouncedInput
          type="number"
          value={filterValue.from ?? ''}
          onChange={value => {
            const nValue = value === '' ? null : value
            const current = (column.getFilterValue() as NumberRangeFilterValue) ?? { from: null, to: null }
            column.setFilterValue({
              from: nValue,
              to: current.to,
            })
          }}
          placeholder={fromPlaceholder}
        />
      </NumberInputWrapper>
      <NumberInputWrapper>
        <DebouncedInput
          type="number"
          value={filterValue.to ?? ''}
          onChange={value => {
            const nValue = value === '' ? null : value
            const current = (column.getFilterValue() as NumberRangeFilterValue) ?? { from: null, to: null }
            column.setFilterValue({
              from: current.from,
              to: nValue,
            })
          }}
          placeholder={toPlaceholder}
        />
      </NumberInputWrapper>
    </div>
  )
}

export default NumberRangeFilter
