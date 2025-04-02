import { Column, FilterFn } from '@tanstack/react-table'
import React from 'react'
import styled from 'styled-components'
import { Select } from '../../Select'

export type SelectOption = { label: string, option: string | number }

export const selectFilterFn : FilterFn<any> = (row, columnId, filterValue) => {
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

const SelectFilter = ({ column, options }: { column: Column<any>, options: SelectOption[] }) => {
  const v = column.getFilterValue()
  return (
    <StyledSelect
      placeholder=""
      options={[{ label: '--', option: '' }, ...options]}
      value={options.find(o => o.option === v)}
      onChange={val => column.setFilterValue(val?.option || undefined)}
      isOptionSelected={o => o.option === v}
      menuPosition="fixed"
    />
  )
}

export default SelectFilter
