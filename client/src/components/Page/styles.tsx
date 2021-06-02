import styled from 'styled-components'
import { commonStyles } from '../../styles/commonStyles'
import { theme } from '../../styles/theme'

export const PageContainer = styled.div`
  padding-left: ${theme.padding.mainContentHorizontal};
  padding-right: ${theme.padding.mainContentHorizontal};
`

export const PageTitle = styled.h1`
  ${commonStyles.pageTitle};
  color: ${theme.colors.textBlack};
  margin: 0;
`

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${theme.padding.mainContentVertical};
`

export const PageActions = styled.div`
  display: flex;
  gap: 10px;
`
