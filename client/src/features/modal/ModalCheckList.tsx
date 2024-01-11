import styled from 'styled-components'
import { Svg } from '../../components/icons/Svg'
import { colors } from '../../styles/theme'

export const TableRow = styled.tr<{ $isSelected?: boolean; onClick?: any }>`
  ${({ $isSelected }) => $isSelected && `color: ${colors.primaryBlue};`}
  ${({ onClick }) => onClick && 'cursor: pointer;'}
`

export const HeaderRow = styled(TableRow)`
  font-weight: bold;
`

export const Table = styled.table`
  width: 100%;
`

export const Col = styled.td`
  padding: 4px 0;
  vertical-align: middle;
`

export const TitleCol = styled(Col)`
  padding-right: 16px;

  ${Svg} {
    margin-right: 8px;
  }
`
export const CheckCol = styled(Col)`
  padding-left: 32px;
  min-width: 30px;
`
export const ColBody = styled.span`
  display: flex;
  align-items: center;
`
