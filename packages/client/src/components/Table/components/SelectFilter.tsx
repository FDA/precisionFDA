import { Column, Row } from '@tanstack/react-table'
import React from 'react'
import styled from 'styled-components'
import { Select } from '../../Select'

export type SelectOption = { label: string, option: string | number }

export const selectFilterFn = <T,>(row: Row<T>, columnId: string, filterValue: unknown): boolean => {
  const cellValue = row.getValue(columnId)
  return filterValue ? cellValue === filterValue : true
}

const StyledSelect = styled(Select)`
  min-width: 30px;
  font-size: 14px;
  font-weight: 400;
  --height: 23px;

  border-radius: 2px;

  .pf-select-option {
    height: var(--height);
    padding: 0 12px;
    display: flex;
    align-items: center;
  }
  .pf-select-control {
    border-radius: 2px;
  }
  .pf-select-input {
    margin: 0;
    & input {
      box-shadow: none;
    }
  }

`

const SelectFilter = <T = unknown>({ column, options }: { column: Column<T>, options: SelectOption[] }) => {
  const v = column.getFilterValue()
  return (
    <StyledSelect
      placeholder=""
      options={[{ label: '--', option: '' }, ...options]}
      value={options.find(o => o.option === v)}
      onChange={(newValue: unknown) => {
        const val = newValue as SelectOption | null
        column.setFilterValue(val?.option || undefined)
      }}
      isOptionSelected={(option: unknown) => {
        const o = option as SelectOption
        return o.option === v
      }}
      menuPosition="fixed"
    />
  )
}

export default SelectFilter
