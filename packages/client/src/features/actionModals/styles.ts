import styled from 'styled-components'
import { compactScrollBarV2 } from '../../components/Page/styles'

export const StyledSubtitle = styled.div`
  color: var(--c-text-500);
`

export const SelectableTable = styled.table`
  padding: 0;
  min-width: max-content;
  tr:hover {
    color: var(--primary-500);
    cursor: pointer;
    background-color: var(--tertiary-100);
  }
`
export const StyledRow = styled.tr`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-top: 1px var(--c-layout-border-200) solid;
  padding: 8px 12px;
`

export const StyledCell = styled.td`
  display: flex;
  flex-direction: column;
`
export const StyledLinkCell = styled.td`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`

export const StyledOnlyMine = styled.label`
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  align-items: center;
`
export const StyledContainer = styled.div`
  margin-right: 8px;
`

export const StyledFilterSection = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0 12px 6px 12px;
`

export const ButtonBadge = styled.div`
  background-color: white;
  color: blue;
  border-radius: 10px;
  padding: 3px 7px;
  line-height: 1;
`

export const StyledFileDetail = styled.div`
  display: flex;
  margin-left: 4px;
  color: var(--c-text-500);
  font-size: 85%;
  padding: 5px;
  flex-wrap: wrap;
`

export const StyledFileDetailItem = styled.span`
  margin-left: 4px;
`

export const Tab = styled.div``

export const StyledAction = styled.a`
  color: var(--primary-500);
  padding: 4px;
`
export const StyledHeading = styled.div`
  font-weight: bolder;
  font-size: 16px;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
`
export const ModalPageRow = styled.div`
  display: grid;
  grid-template-columns: auto auto;
`
export const ScrollPlace = styled.div`
  ${compactScrollBarV2}
  overflow-y: auto;
  max-height: 50vh;
  min-height: 50vh;
`
export const ModalPageCol = styled.div`
  flex-grow: 1;
  flex-shrink: 0;
  align-self: stretch;
  min-width: 350px;
  height: 100%;
  border-right: 1px solid var(--c-layout-border-200);
  &:last-child {
    border: 0;
  }
`

export const Sticky = styled.div`
  position: sticky;
  top: 0;
  background-color: var(--background);
`

export const StyledLoader = styled.div`
  padding: 12px;
`

export const SyledFilterWrapper = styled.div`
  display: flex;
  gap: 4px;
`

export const StyledFilterFileSection = styled(StyledFilterSection)`
  display: block;
`

export const StyledFieldInfoWrapper = styled.div`
  margin-top: 5px;
  font-size: 13px;
`
export const TabContent = styled.div`
  padding: 8px 12px;
`
export const LabelWrap = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`
export const StyledCellNoShrink = styled(StyledCell)`
  flex-shrink: 0;
`
export const SelectionWrap = styled.div`
  margin-right: 8px;
  flex-shrink: 0;
  padding: 4px;
`
export const SyledUid = styled.div`
  font-weight: bold;
  display: flex;
  justify-content: space-between;
`
export const Card = styled.div`
  padding: 16px;
  border: 1px solid var(--c-layout-border-200);
  border-radius: 8px;
  background-color: var(--warning-100);
`
