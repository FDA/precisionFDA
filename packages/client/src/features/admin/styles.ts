import styled from 'styled-components'
import { BreadcrumbDivider, StyledBreadcrumbs } from '../../components/Breadcrumb'
import { Svg } from '../../components/icons/Svg'
import { StyledPageTable } from '../../components/Table/components/styles'

export const Title = styled.div`
  display: flex;
  font-size: 24px;
  font-weight: bold;
  align-items: center;
  margin: 16px 0;
  margin-right: 16px;
  margin-bottom: 8px;
  gap: 8px;
`

export const TopLeft = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`

export const Topbox = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding-left: 32px;
  padding-right: 16px;
`

export const AdminSectionBreadcrumbs = styled(StyledBreadcrumbs)`
  padding-top: 16px;
  padding-left: 32px;

  a {
    color: var(--c-text-500);

    &:last-child {
      color: var(--c-text-400);
    }
  }
`

export const AdminSectionBreadcrumbDivider = styled(BreadcrumbDivider)`
  margin: 0 8px;
  color: var(--c-text-500);
`

export const StateLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: capitalize;

  ${Svg} {
    width: 15px;
  }
  min-width: max-content;
`

export const AdminStyledPageTable = styled(StyledPageTable)`
  tr:nth-child(odd) {
    td {
      background-color: var(--c-textarea-bg);
    }
  }
`
