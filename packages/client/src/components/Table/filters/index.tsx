import React, { useState } from 'react'
import { InputSelect } from '../../form/styles'
import { InputId, InputNumber, InputText } from '../../InputText'

export * from './numericFilter'

const sanitizeRangeFilterValue = (rawValue: string | [number | null | undefined, number | null | undefined]) => {
  if (typeof rawValue === 'string') {
    return rawValue.split(',')
  }
  // No idea what's the reason behind this, just want to avoid breaking change
  let v = rawValue
  if(v[0] === undefined) {
    v[0] = null
  }
  return v
}

export function NumberRangeColumnFilter({
  column: { filterValue = [null,null], setFilter, filterDataTestId, filterPlaceholderFrom, filterPlaceholderTo },
}: any) {
  const parsedFilterValue = sanitizeRangeFilterValue(filterValue)
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
        onChange={e => {
          const val = e.target.value
          setFilter((old = []) => [val ? parseInt(val, 10) : null, old[1]])
        }}
        min={0}
        placeholder={filterPlaceholderFrom}
        style={{
          width: '72px',
          fontSize: 11,
          lineHeight:'1.1rem',
          paddingRight: 2
        }}
      />
      <InputNumber
        value={parsedFilterValue[1] || ''}
        type="number"
        onChange={e => {
          const val = e.target.value
          setFilter((old = []) => [old[0], val ? parseInt(val, 10) : null])
        }}
        min={0}
        placeholder={filterPlaceholderTo}
        style={{
          width: '72px',
          fontSize: 11,
          lineHeight:'1.1rem',
          paddingRight: 2
        }}
      />
    </div>
  )
}

export function SelectColumnFilter({
  column: { filterValue, setFilter, options, filterDataTestId, title },
}: any) {
  return (
    <InputSelect
      title={title}
      value={filterValue}
      onChange={e => setFilter(e.target.value || undefined)}
      data-testid={filterDataTestId}
    >
      <option value="">All</option>
      {options.map((option: any, i: number) => (
        <option key={i} value={option.value}>
          {option.label}
        </option>
      ))}
    </InputSelect>
  )
}

export function DefaultColumnFilter({
  column: { filterValue, setFilter, filterDataTestId },
}: {
  column: any
}) {
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
}: {
  column: any
}) {
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
