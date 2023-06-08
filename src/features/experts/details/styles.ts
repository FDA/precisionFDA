import { Tab, TabList, Tabs } from 'react-tabs'
import styled from 'styled-components'

import { ButtonSolidBlue } from '../../../components/Button'
import { PageContainer, PageLeftColumn, PageRightColumn, pagePadding, PageContainerMargin } from '../../../components/Page/styles'
import { breakPoints } from '../../../styles/theme'


export const CallToActionButton = styled(ButtonSolidBlue)`
  display: block;
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

export const PageContainerCenter = styled(PageContainerMargin)`
  
`
export const ExpertRow = styled.div`
  display: flex;
  gap: 32px;
  padding: 32px 0;
  flex: 1;
`

export const ExpertData = styled.div`
    flex: 1 0 auto;
    margin-bottom: 64px;
    
    display: flex;
    flex-direction: column;
    font-size: 15px;
    h1 {
      font-size: 25px;
      color: white;
      word-wrap: break-word;
    }
`
export const ExpertImage = styled.img`
  width: 148px;
  height: 148px;
  border-radius: 50%;
`
export const Filler = styled.div`
  width: 148px;
  height: 148px;
  min-width: 148px;
`

export const StyledTabList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  margin-bottom: 24px;
`
export const StyledTab = styled.div`
    list-style: none;
    font-size: 14px;
    font-weight: 700;
    display: inline-block;
    text-transform: uppercase;
    letter-spacing: 0;
    margin-right: 12px;
    padding: 0 0 2px 0;
    cursor: pointer;
    color: #3776a9;
    border-bottom: 3px solid transparent;

  &:hover {
    border-bottom: 3px solid #646464;
  }
  &.selected {
    color: #3776a9;
    border-bottom: 3px solid #eb776f;

    &:hover {
      border-bottom: 3px solid #eb776f;
    }
  }
`

export const StyledTabsExpertPage = styled.div`

`
export const StyledPageRightColumn = styled(PageRightColumn)`
`
export const StyledPageLeftColumn = styled(PageLeftColumn)`
  /* margin-left: 13%; */
`
