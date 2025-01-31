import React, { useState } from 'react'
import { InputSelect } from '../../form/styles'
import { InputDateTime, InputId, InputNumber, InputText } from '../../InputText'

export * from './numericFilter'

interface ColumnFilterOption {
  value: string
  label: string
}

interface BaseColumnFilterProps<TFilterValue> {
  column: {
    filterValue: TFilterValue | undefined
    setFilter: (value: TFilterValue | undefined) => void
    filterDataTestId?: string
  }
}

interface ColumnFilterProps extends BaseColumnFilterProps<string> {
  column: BaseColumnFilterProps<string>['column'] & {
    options: ColumnFilterOption[]
    title: string
  }
}

interface RangeColumnFilterProps extends BaseColumnFilterProps<string> {
  column: BaseColumnFilterProps<string>['column'] & {
    filterPlaceholderFrom?: string
    filterPlaceholderTo?: string
  }
}

function parseNumberRange(range: string): [number | null, number | null] {
  const [lower, upper] = range.split(',').map((value) => (value ? parseFloat(value) : null))
  return [lower, upper]
}

function parseDateRange(filterValue: string): [Date | null, Date | null] {
  const [from, to] = filterValue.split(',').map((value) => (value && value !== '0' ? new Date(value) : null))
  return [from, to]
}

function formatDateForInput (date: Date | null): string {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function DateRangeColumnFilter({
                                        column: {
                                          filterValue = '',
                                          setFilter,
                                          filterDataTestId,
                                          filterPlaceholderFrom = 'From Date',
                                          filterPlaceholderTo = 'To Date',
                                        },
                                      }: RangeColumnFilterProps) {
  const parsedFilterValue = parseDateRange(filterValue) || [null, null]

  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
      }}
      data-testid={filterDataTestId}
    >
      <InputDateTime
        value={parsedFilterValue[0] ? formatDateForInput(parsedFilterValue[0]) : ''}
        onChange={(e) => {
          const val = e.target.value
          setFilter([val || null, parsedFilterValue[1]]?.join(',') || '')
        }}
        placeholder={filterPlaceholderFrom}
        style={{
          width: '160px',
          fontSize: 11,
          lineHeight: '1.1rem',
          paddingRight: 2,
        }}
      />
      <InputDateTime
        value={parsedFilterValue[1] ? parsedFilterValue[1].toISOString().slice(0, -8) : ''}
        onChange={(e) => {
          const val = e.target.value
          setFilter([parsedFilterValue[0], val || null]?.join(',') || '')
        }}
        placeholder={filterPlaceholderTo}
        style={{
          width: '160px',
          fontSize: 11,
          lineHeight: '1.1rem',
          paddingRight: 2,
        }}
      />
    </div>
  )
}

export function NumberRangeColumnFilter({
                                          column: { filterValue = '', setFilter, filterDataTestId, filterPlaceholderFrom, filterPlaceholderTo },
                                        }: RangeColumnFilterProps) {
  const parsedFilterValue = parseNumberRange(filterValue) || [null, null]

  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
      }}
      data-testid={filterDataTestId}
    >
      <InputNumber
        value={parsedFilterValue[0] || ''}
        onChange={(e) => {
          const val = e.target.value
          setFilter([val ? parseInt(val, 10) : null, parsedFilterValue[1]]?.join(',') || '')
        }}
        min={0}
        placeholder={filterPlaceholderFrom}
        style={{
          width: '72px',
          fontSize: 11,
          lineHeight: '1.1rem',
          paddingRight: 2,
        }}
      />
      <InputNumber
        value={parsedFilterValue[1] || ''}
        onChange={(e) => {
          const val = e.target.value
          setFilter([parsedFilterValue[0], val ? parseInt(val, 10) : null]?.join(',') || '')
        }}
        min={0}
        placeholder={filterPlaceholderTo}
        style={{
          width: '72px',
          fontSize: 11,
          lineHeight: '1.1rem',
          paddingRight: 2,
        }}
      />
    </div>
  )
}

export function SelectColumnFilter({
  column: { filterValue, setFilter, options, filterDataTestId, title },
}: ColumnFilterProps) {
  return (
    <InputSelect
      title={title}
      value={filterValue}
      onChange={e => setFilter(e.target.value || undefined)}
      data-testid={filterDataTestId}
    >
      <option value="">All</option>
      {options.map((option: ColumnFilterOption, i: number) => (
        <option key={i} value={option.value}>
          {option.label}
        </option>
      ))}
    </InputSelect>
  )
}

export function DefaultColumnFilter({
  column: { filterValue, setFilter, filterDataTestId },
}:  ColumnFilterProps) {
  return (
    <InputText
      value={filterValue || ''}
      onChange={e => setFilter(e.target.value)}
      placeholder='--'
      style={{ lineHeight: '1.1rem' }}
      data-testid={filterDataTestId}
    />
  )
}

export function IdColumnFilter({
  column: { filterValue, setFilter, filterDataTestId },
}: ColumnFilterProps) {
  const [value, setValue] = useState(filterValue || '')
  const handleChange = (e) => {
    const inputValue = e.target.value
    const filteredValue = inputValue.replace(/\D/g, '') // Remove non-digit characters
    setValue(filteredValue)
    setFilter(filteredValue)
  }

  return (
    <InputId
      value={ value }
      onChange={ handleChange }
      placeholder='--'
      style={{ lineHeight: '1.1rem' }}
      data-testid={ filterDataTestId }
    />
  )
}
