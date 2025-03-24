import styled from 'styled-components'
import { Callout } from '../../components/Callout'
import { PageContainer, pagePadding } from '../../components/Page/styles'

export const StyledPageContainer = styled(PageContainer)`
  ${pagePadding}
  padding-left: 0;
  padding-right: 0;
  flex-direction: column;
`

export const StyledCallout = styled(Callout)`
  margin: 20px 0;
`

export const PublishingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

export const ItemTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  display: flex;
  flex-direction: row;
  gap: 4px;
`

export const DepList = styled.table`
  margin: 0;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 4px;
  border-spacing: 0;
`

export const DepListHead = styled.thead`
  background-color: rgba(0, 0, 0, 0.03);
`

export const DepListRow = styled.tr`
  &:last-child {
    td {
      border-bottom: none;
    }
  }
`
export const DepListHeadCell = styled.th`
  text-align: left;
  padding: 10px;
  line-height: 30px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
`
export const DepListBody = styled.tbody``
export const DepListCell = styled.td`
  padding: 10px;
  line-height: 30px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  vertical-align: top;
  &:first-child {
    width: 50px;
  }
  table {
    margin-top: 12px;
  }
`

export const DepListCheckbox = styled.div``

export const DepListItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const PublishingItemContent = styled.span`
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
`
