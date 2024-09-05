import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { breakPoints } from '../../styles/theme'
import { compactScrollBarV2 } from '../Page/styles'

export const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
`
export const ItemDate = styled.div`
  color: var(--c-text-500);
  font-size: 14px;
  font-weight: bold;
  border-top: 1.5px solid var(--tertiary-200);
  line-height: 36px;
  padding-right: 16px;
  min-width: 128px;
  max-width: 128px;
  text-transform: uppercase;
  letter-spacing: 0.7px;
`
export const Title = styled.div`
  color: var(--c-text-700);
  font-size: 20px;
  font-weight: bold;
  line-height: 20px;
`
export const PageLoaderWrapper = styled.div`
  flex: 1 0 auto;
`
export const Content = styled.div`
  color: var(--c-text-700);
  font-size: 14px;
  line-height: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const RightSideItem = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  line-height: 20px;
  color: var(--c-text-500);
  padding-bottom: 32px;
  border-bottom: 1px solid var(--tertiary-200);
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
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  color: var(--c-text-500);
  letter-spacing: 0.7px;
  margin-bottom: 16px;
`
export const NewsListItem = styled.div`
  display: flex;
  gap: 32px;
`
export const PageMainBody = styled.div`
  ${compactScrollBarV2}
  display: flex;
  flex: 1;
  flex-grow: 1;
  overflow-y: scroll;
  justify-content: center;
  padding: 0 16px;
`
export const PageFilterTitle = styled.h2`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 32px;
  margin-top: 0;
  text-transform: uppercase;
  color: var(--c-text-500);
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
export const ListItem = styled(Link)``

export const RightList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-left: 12px;

  ${ListItem} {
    cursor: pointer;
  }
`
export const Container = styled.div`
  margin-inline: auto;
  width: min(100% - 32px, 1100px);
`

export const ItemButton = styled.button<{ selected?: boolean }>`
  border-radius: 3px;
  border-color: transparent;
  background: none;
  padding: 3px 4px;
  color: var(--primary-500);
  cursor: pointer;
  &:hover {
    color: var(--primary-400);
  }
  ${({ selected }) => selected && css`
    background-color: var(--primary-500);
    color: white;
    &:hover {
      color: white;
    }
  `}
`

export const NoContent = styled.div`
  display: flex;
  height: 50%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
`
