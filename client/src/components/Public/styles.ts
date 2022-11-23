import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { PageContainer } from '../Page/styles'
import { breakPoints, colors } from '../../styles/theme'

export const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
`
export const ItemDate = styled.div`
  color: ${colors.textMediumGrey};
  font-size: 14px;
  font-weight: bold;
  border-top: 1.5px solid #dbdbdb;
  line-height: 36px;
  padding-right: 16px;
  min-width: 128px;
  max-width: 128px;
  text-transform: uppercase;
  letter-spacing: 0.7px;
`
export const Title = styled.div`
  color: ${colors.textBlack};
  font-size: 20px;
  font-weight: bold;
  line-height: 20px;
`
export const PageLoaderWrapper = styled.div`
  flex: 1 0 auto;
`
export const Content = styled.div`
  color: ${colors.textDarkGrey};
  font-size: 14px;
  line-height: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const RightSideItem = styled.div`
  font-size: 14px;
  line-height: 20px;
  color: ${colors.textMediumGrey};
  padding-bottom: 44px;
  border-bottom: 1px solid #dbdbdb;
`
export const RightSide = styled.div`
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  order: -1;
  ${RightSideItem}:last-child {
    border-bottom: 0;
  }
`

export const SectionTitle = styled.h3`
  margin: 0;
  padding: 0;
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  color: ${colors.textMediumGrey};
  letter-spacing: 0.7px;
  margin-bottom: 16px;
`
export const NewsListItem = styled.div`
  display: flex;
  gap: 32px;
`
export const PageMainBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  flex-grow: 1;
`
export const PageFilterTitle = styled.h2`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 32px;
  margin-top: 0;
  text-transform: uppercase;
  color: ${colors.textMediumGrey};
`

export const PageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  flex: 1;
`
export const ItemBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1 1 auto;
  iframe {
    width: 100%;
    max-width: 600px;
    min-height: 300px;
  }
`

export const PageRow = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column-reverse;
  gap: 64px;
  padding: 64px 0;
  @media (min-width: ${breakPoints.large}px) {
    flex-direction: row;
    justify-content: space-between;
    ${RightSide} {
      order: 2;
      flex: 0 1 auto;
      min-width: 256px;
      max-width: 256px;
    }
  }
`

export const RightList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`
export const ListItem = styled(Link)``
export const Container = styled.div`
  margin-inline: auto;
  width: min(100% - 32px, 1100px);
`

export const ItemButton = styled.button<{ selected?: boolean }>`
  border-radius: 3px;
  border-color: rgba(255, 255, 255, 0);
  background: none;
  padding: 3px 4px;
  color: ${colors.primaryBlue};
  cursor: pointer;
  &:hover {
    color: ${colors.lightBlue};
  }
  ${({ selected }) => selected && css`
    background-color: ${colors.primaryBlue};
    color: white;
    &:hover {
      color: white;
    }
  `}
`
