import styled from 'styled-components'

import { ButtonSolidBlue } from '../../../../components/Button'
import { PageContainer, PageLeftColumn, PageRightColumn, pagePadding } from '../../../../components/Page/styles'
import { breakPoints } from '../../../../styles/theme'


export const CallToActionButton = styled(ButtonSolidBlue)`
  display: block;
  width: 100%;
  margin-bottom: 0px;
`

export const StyledPageContainer = styled(PageContainer)`
  ${pagePadding}
  display: flex;
  flex-direction: column;
  min-height: inherit;

  @media(min-width: ${breakPoints.medium}px) {
    flex-direction: row;
    ${PageLeftColumn} {
      padding-right: 16px;
    }
  }
`

export const StyledTabsExpertPage = styled.div`
  width: 95%;
  margin-left: 3%;
`
export const StyledPageRightColumn = styled(PageRightColumn)`
  margin-left: 3%;
`
export const StyledPageLeftColumn = styled(PageLeftColumn)`
  margin-left: 13%;
`
