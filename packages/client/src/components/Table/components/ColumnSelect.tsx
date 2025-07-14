import { Table } from '@tanstack/react-table'
import React from 'react'
import styled from 'styled-components'
import { TransparentButton } from '../../Button'
import Dropdown from '../../Dropdown'
import { ColumnsIcon } from '../../icons/ColumnsIcon'
import { Checkbox } from '../../CheckboxNext'

const Back = styled.div`
  grid-area: 1 / 1;
  background-color: var(--background);
  width: 32px;
  height: 32px;
  filter: blur(3px);
`

const Front = styled(Dropdown)`
  grid-area: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  width: 32px;
  color: var(--tertiary-400);
  svg:hover {
    color: var(--tertiary-500);
  }
`

const StyledDropdownContent = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 13px;
  color: var(--base);
  min-width: 120px;
`

const Row = styled.label`
  position: relative;
  padding: 3px 16px 3px 8px;
  cursor: pointer;
  display: flex;
  gap: 8px;
  align-items: center;
  &:hover {
    background-color: var(--c-dropdown-hover-bg);
  }
`
const SectionText = styled.div`
  padding: 3px 16px 3px 8px;
`

export function ColumnSelect<T>({ table }: { table: Table<T> }) {
  const allCols = table.getAllLeafColumns().filter(c => typeof c.columnDef?.header === 'string')
  const mainCols = allCols.filter(c => !c.id?.startsWith('props.'))
  const propCols = allCols.filter(c => c.id?.startsWith('props.'))

  const content = () => {
    return (
      <StyledDropdownContent>
        {mainCols.map(column => {
          return (
            <Row key={column.id}>
              <Checkbox
                {...{
                  type: 'checkbox',
                  checked: column.getIsVisible(),
                  onChange: column.getToggleVisibilityHandler(),
                }}
              />{' '}
              {column.columnDef?.header as string}
            </Row>
          )
        })}
        <SectionText>{propCols.length > 0 && 'Properties'}</SectionText>
        {propCols.map(column => {
          return (
            <Row key={column.id} className="px-1">
              <Checkbox
                {...{
                  type: 'checkbox',
                  checked: column.getIsVisible(),
                  onChange: column.getToggleVisibilityHandler(),
                }}
              />{' '}
              {column.columnDef?.header as string}
            </Row>
          )
        })}
      </StyledDropdownContent>
    )
  }
  return (
    <th className="col-visible">
      <Front trigger="click" content={content()}>
        {dropdownProps => (
          // @ts-expect-error ref is not compatible
          <TransparentButton {...dropdownProps} active={dropdownProps.$isActive ? 'true' : 'false'} title="Column Select">
            <ColumnsIcon height={14} />
          </TransparentButton>
        )}
      </Front>
      <Back />
    </th>
  )
}
