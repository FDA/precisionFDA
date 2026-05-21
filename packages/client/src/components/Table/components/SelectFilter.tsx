import type { Column, Row } from '@tanstack/react-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/utils/cn'

export type SelectOption = { label: string; option: string | number }

export const selectFilterFn = <T,>(row: Row<T>, columnId: string, filterValue: unknown): boolean => {
  const cellValue = row.getValue(columnId)
  return filterValue ? cellValue === filterValue : true
}

const SelectFilter = <T = unknown>({ column, options }: { column: Column<T>; options: SelectOption[] }) => {
  const v = column.getFilterValue()
  const isActive = v !== undefined && v !== ''

  const items = [{ label: '--', value: '' }, ...options.map(o => ({ label: o.label, value: String(o.option) }))]

  const selectedValue =
    v !== undefined && v !== '' && options.some(o => o.option === v) ? String(v as string | number) : null

  return (
    <Select
      items={items}
      value={selectedValue}
      onValueChange={next => {
        if (next == null || next === '') {
          column.setFilterValue(undefined)
          return
        }
        const chosen = options.find(o => String(o.option) === next)
        column.setFilterValue(chosen?.option)
      }}
    >
      <SelectTrigger
        className={cn(
          'h-7! min-h-7! py-0! pl-2! pr-1! min-w-[30px] w-full justify-between rounded-md border-(--c-input-border) text-sm font-normal transition-colors duration-150 ease-out [&_svg]:size-3.5!',
          'hover:border-(--primary-400)',
        )}
        size="sm"
      >
        <SelectValue placeholder="" />
      </SelectTrigger>
      <SelectContent align="start">
        {items.map(item => (
          <SelectItem key={item.value === '' ? '__clear' : item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default SelectFilter
