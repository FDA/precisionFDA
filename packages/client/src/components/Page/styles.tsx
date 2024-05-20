import styled, { css } from 'styled-components'
import { commonStyles } from '../../styles/commonStyles'
import { breakPoints, padding } from '../../styles/theme'
import { Svg } from '../icons/Svg'

export const compactScrollBar = css`
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 4px;
  }
  &::-webkit-scrollbar {
    width: 7px;
    height: 7px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--c-scrollbar);
    border-radius: 4px;
  }
`

export const pagePadding = css`
  padding: 8px;

  @media (min-width: ${breakPoints.small}px) {
    padding: 16px;
  }

  @media (min-width: ${breakPoints.medium}px) {
    padding: 32px;
  }
`

export const PageLoadWrapper = styled.div`
  flex: 1 0 auto;
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
export const pageContainer = css`
  margin-inline: auto;
  width: min(100% - 32px, 900px);
`

export const FormPageContainer = styled.div`
  ${pageContainer}
`

export const PageContainerMargin = styled.div`
  --container-width: 1330px;

  flex: 1 1 auto;
  margin-inline: auto;
  width: min(100% - 32px, var(--container-width));

  @media(min-width: 1045px) {
    width: min(100% - 64px, var(--container-width));
  }
`

export const PageTitle = styled.h1`
  ${commonStyles.pageTitle};
  margin: 0;
`

export const Small = styled.div`
  font-size: 13px;
`

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const PageActions = styled.div`
  display: flex;
  gap: 10px;
`

export const VerticalCenter = styled.span`
  display: flex;
  align-items: center;
`

export const Refresh = styled.span<{ $spin?: boolean }>`
  display: flex;
  align-items: center;
  cursor: pointer;

  ${Svg} {
    animation-name: ${({ $spin }) => ($spin ? 'spin' : 'none')};
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

export const Filler = styled.div<{ $size: number }>`
  height: ${({ $size }) => $size}px;
`

export const compactScrollBarV2 = css`
  &::-webkit-scrollbar-track {
    background-color: transparent;
    border-radius: 20px;
    border: solid 5px transparent;
    box-sizing: border-box;
  }
  &::-webkit-scrollbar {
    width: 18px;
    height: 18px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--c-scrollbar);
    border-radius: 20px;
    border: solid 5px transparent;
    background-clip: content-box;
    min-height: 30px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--c-scrollbar-2);
    border-radius: 20px;
    border: solid 5px transparent;
    background-clip: content-box;
  }
`
