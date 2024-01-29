import styled from 'styled-components'
import { colors } from '../../styles/theme'

export const StyledSubtitle = styled.div`
  color: ${colors.textMediumGrey};
  font-size: 85%;
`

export const SelectableTable = styled.table`
  padding: 0;
  width: 100%;
  tr:hover {
    color: ${colors.primaryBlue};
    cursor: pointer;
    background-color: ${colors.subtleBlue};
  }
`
export const StyledRow = styled.tr`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-top: 1px ${colors.textLightGrey} solid;
  padding: 8px;
`

export const StyledCell = styled.td`
  display: flex;
  flex-direction: column;
`


export const StyledOnlyMine = styled.label`
  display: flex;
  flex-shrink: 0;
  align-items: center;
`
export const StyledContainer = styled.div`
  margin-right: 8px;
`

export const StyledFilterSection = styled.div`
  display: flex;
  flex-direction: row;
  padding: 12px 12px;
`

export const ButtonBadge = styled.div`
  background-color: white;
  color: blue;
  border-radius: 10px;
  padding: 3px 7px;
  line-height: 1;
`

export const StyledFileDetail = styled.div`
  margin-left: 28px;
  color: ${colors.textMediumGrey};
  font-size: 85%;
  padding: 5px;
`

export const StyledFileDetailItem = styled.span`
  margin-left: 10px;
`

export const Tab = styled.div``

export const StyledAction = styled.a`
  color: ${colors.primaryBlue};
  padding: 12px;
`
