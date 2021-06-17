import styled, { css } from 'styled-components'
import { commonStyles } from '../../styles/commonStyles'
import { colors, breakPoints, sizing, padding } from '../../styles/theme'

export const pagePadding = css`
  padding: 8px;

  @media(min-width: ${breakPoints.small}px) {
    padding: 16px;
  }

  @media(min-width: ${breakPoints.medium}px) {
    padding: 32px;
  }
`

export const PageLeftColumn = styled.div`
  flex: 1 1 auto;
`

export const PageRightColumn = styled.div`
  flex: 0 1 auto;
  min-width: 300px;

  p {
    padding-top: 8px;
  }
`

export const PageContainer = styled.div`
  max-width: 1330px;
  margin-left: auto;
  margin-right: auto;
`

export const PageTitle = styled.h1`
  ${commonStyles.pageTitle};
  color: ${colors.textBlack};
  margin: 0;
`

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${padding.mainContentVertical};
`

export const PageActions = styled.div`
  display: flex;
  gap: 10px;
`
