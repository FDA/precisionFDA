import { Column, RowData, Table } from '@tanstack/react-table'
import React from 'react'
import DebouncedInput from './DebouncedInput'

type NumberInputProps = {
  columnFilterValue: [number, number]
  getFacetedMinMaxValues: () => [number, number] | undefined
  setFilterValue: (updater: any) => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NumberInput: React.FC<NumberInputProps> = ({
  columnFilterValue,
  getFacetedMinMaxValues,
  setFilterValue,
}) => {
  const minOpt = getFacetedMinMaxValues()?.[0]
  const min = Number(minOpt ?? '')

  const maxOpt = getFacetedMinMaxValues()?.[1]
  const max = Number(maxOpt)

  return (
    <div className='p-1'>
      <div className="flex space-x-2">
        <DebouncedInput
          type="number"
          min={min}
          max={max}
          value={columnFilterValue?.[0] ?? ''}
          onChange={value =>
            setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`Min ${minOpt ? `(${min})` : ''}`}
          className="w-24 border shadow rounded"
        />
        <DebouncedInput
          type="number"
          min={min}
          max={max}
          value={columnFilterValue?.[1] ?? ''}
          onChange={value =>
            setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`Max ${maxOpt ? `(${max})` : ''}`}
          className="w-24 border shadow rounded"
        />
      </div>
    </div>
  )
}

type TextInputProps = {
  columnId: string
  columnFilterValue: string
  columnSize: number
  setFilterValue: (updater: any) => void
}

const TextInput: React.FC<TextInputProps> = ({
  columnId,
  columnFilterValue,
  setFilterValue,
}) => {
  const dataListId = `${columnId  }list`

  return (
    <div className="filter-input-wrap">
      <DebouncedInput
        type="text"
        value={columnFilterValue ?? ''}
        onChange={value => setFilterValue(value)}
        className="filter-input"
        list={dataListId}
      />
    </div>
  )
}

type Props<T extends RowData> = {
  column: Column<T, unknown>
  table: Table<T>
}

export function Filter<T extends RowData>({ column }: Props<T>) {
  const columnFilterValue = column.getFilterValue()
  const uniqueValues = column.getFacetedUniqueValues()

  return <TextInput
      columnId={column.id}
      columnFilterValue={columnFilterValue as string}
      columnSize={uniqueValues.size}
      setFilterValue={column.setFilterValue}
    />
}

export default Filter
