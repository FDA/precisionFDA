import React from 'react'
import styled, { css } from 'styled-components'
import { theme } from '../../styles/theme'
import { Button } from '../Button'
import { Svg } from '../icons/Svg'

export const StyledTable = styled.table`
  border-spacing: 0;
  width: 100%;
  th {
    text-align: left;
    padding: 8px;
  }
`

export const StyledAction = styled(Button)`
  align-self: flex-end;
  ${Svg} {
    padding-right: 0.4rem;
  }
`
export const StyledName = styled.a<{ isCurrent?: boolean }>`
  display: flex;
  align-items: center;
  cursor: pointer;
  ${({ isCurrent }) => isCurrent && css`color:${theme.colors.primaryBlue};`}
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
