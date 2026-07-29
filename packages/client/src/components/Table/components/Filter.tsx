import type { Column, RowData } from '@tanstack/react-table'
import type React from 'react'
import DebouncedInput from './DebouncedInput'

type TextInputProps = {
  columnId: string
  columnFilterValue: string
  setFilterValue: (updater: any) => void
}

const TextInput: React.FC<TextInputProps> = ({ columnId, columnFilterValue, setFilterValue }) => {
  return (
    <div className="filter-input-wrap">
      <DebouncedInput
        type="text"
        value={columnFilterValue ?? ''}
        onChange={value => setFilterValue(value)}
        className="shadow-xs"
        data-testid={`filter-input-${columnId}`}
      />
    </div>
  )
}

type Props<T extends RowData> = {
  column: Column<T, unknown>
}

export function Filter<T extends RowData>({ column }: Props<T>) {
  const columnFilterValue = column.getFilterValue()

  return (
    <TextInput
      columnId={column.id}
      columnFilterValue={columnFilterValue as string}
      setFilterValue={column.setFilterValue}
    />
  )
}

export default Filter
