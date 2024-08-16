import React from 'react'
import styled from 'styled-components'
import { Button } from '../Button'
import { Svg } from '../icons/Svg'

export const StyledTable = styled.table`
  border-spacing: 0;
  width: 100%;
  th {
    text-align: left;
    padding: 8px;
    font-weight: bold;
  }
`

export const StyledAction = styled(Button)`
  align-self: flex-end;
  ${Svg} {
    padding-right: 0.4rem;
  }
`

export const ItemTitle = styled.div``

export const StyledName = styled.a<{ isCurrent?: boolean }>`
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  flex-shrink: 0;
  white-space:normal;
  word-break:break-all;
  gap: 8px;

  & > * {
    flex-shrink: 0;
    margin-top: 2px;
  }

  ${ItemTitle} {
    margin-top: 0;
    flex-shrink: 1;
  }
`

export const StyledNameWithoutLink = styled.div<{ isCurrent?: boolean }>`
  display: flex;
  align-items: center;
  ${Svg} {
    padding-right: 0.8rem;
  }
`

export const StyledTD = styled.td`
  padding: 8px;
  vertical-align: middle;
`
type Row = {
  [key: string]: React.ReactNode;
}

export const ResourceTable: React.FC<{ rows: Row[]}> = ({ rows, ...rest }) => (
  <StyledTable {...rest}>
    <thead>
      <tr>
        <th>Name</th>
        <th>Location</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr key={i}>
          {Object.keys(row).map((col, n) => <StyledTD key={n}>{row[col]}</StyledTD>)}
        </tr>
      ))}
    </tbody>
  </StyledTable>
)
