import styled, { css } from 'styled-components'
import { commonStyles } from '../../styles/commonStyles'
import { colors, breakPoints, padding } from '../../styles/theme'
import { Svg } from '../icons/Svg'

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
  flex: 1 0 auto;
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

export const VerticalCenter = styled.span`
  display: flex;
  align-items: center;
`

export const Refresh = styled.span<{spin?: boolean}>`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: ${colors.textDarkGrey};

  ${Svg}{
    animation-name: ${({ spin }) => spin ? 'spin' : 'none'};
    animation-duration: 2000ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`
export const Row = styled.div`
  display: flex;
`
export const PageContentItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 16px 0;
`
