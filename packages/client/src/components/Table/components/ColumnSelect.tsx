import { Table } from '@tanstack/react-table'
import React from 'react'
import styled from 'styled-components'
import { TransparentButton } from '../../Button'
import Menu from '../../Menu/Menu'
import { ColumnsIcon } from '../../icons/ColumnsIcon'

const Back = styled.div`
  background-color: var(--background);
  width: 32px;
  height: 32px;
  filter: blur(3px);
  grid-area: 1 / 1;
`
const ColumnIconContainer = styled.div`
  display: grid;
  place-items: center;
`

const IconWrapper = styled.div`
  grid-area: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
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
      <>
        {mainCols.map(column => {
          return (
            <Menu.CheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={() => column.toggleVisibility()}
            >
              {column.columnDef?.header as string}
            </Menu.CheckboxItem>
          )
        })}
        {propCols.length > 0 && <SectionText>Properties</SectionText>}
        {propCols.map(column => {
          return (
            <Menu.CheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={() => column.toggleVisibility()}
            >
              {column.columnDef?.header as string}
            </Menu.CheckboxItem>
          )
        })}
      </>
    )
  }
  return (
    <th className="col-visible">
      <Menu
        trigger={
          <Menu.Trigger className='p-0' aria-label="Column Select">
            <ColumnIconContainer>
              <Back />
              <IconWrapper>
                <ColumnsIcon height={14} />
              </IconWrapper>
            </ColumnIconContainer>
          </Menu.Trigger>
        }
      >
        {content()}
      </Menu>
    </th>
  )
}
