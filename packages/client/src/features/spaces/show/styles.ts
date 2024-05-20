import styled, { css } from 'styled-components'
import { Button } from '../../../components/Button'
import { Svg } from '../../../components/icons/Svg'

const marginBottom = css`
  margin-bottom: 16px;
`

export const SpaceMainInfo = styled.div`
  display: flex;
  flex-direction: column;
  ${marginBottom}
  `

export const SpaceHeaderDescrip = styled.div`
  font-size: 14px;
  color: var(--c-text-500);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  max-width: 650px;

  ${Svg} {
    margin-right: 8px;
  }
`

export const SpaceHeaderTitle = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: var(--c-text-700);
  margin: auto 0;
  margin-bottom: 8px;
  display: inline-block;

  svg {
    margin-left: 8px;
  }
`

export const ActionButton = styled(Button)`
  color: var(--c-text-700);
  background: var(--tertiary-70);
  border: 1px solid var(--c-layout-border);

  &:hover {
    background: var(--tertiary-50);
    color: var(--c-text-800);
  }
`

export const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  height: 32px;
  flex-wrap: wrap;
  ${marginBottom}
`
export const Tabs = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  padding: 0px;
  gap: 10px;
  margin-bottom: -1px;
`
export const Tab = styled.div<{ $isactive?: string }>`
  font-size: 14px;
  font-weight: 600;
  box-sizing: border-box;
  background: var(--tertiary-100);
  border-width: 1px 1px 1px 1px;
  border-style: solid;
  border-color: var(--c-layout-border);
  border-radius: 4px 4px 0px 0px;
  padding: 6px 20px;
  color: var(--c-text-400);
  cursor: pointer;
  flex: 1 0 auto;
  
  ${({ $isactive }) => $isactive &&
    css`
      background: var(--background);
      border-bottom: 0;
      color: var(--c-text-700);
      &:hover {
        color: var(--c-text-700);
      }
    `}
`
export const TransparentTab = styled(Tab)`
  border: none;
  background: transparent;
  cursor: initial;
  color: var(--c-text-700);
`
export const KeyValRow = styled.div`
  display: flex;
  gap: 32px;
  ${marginBottom}
`

export const TopSpaceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 8px;
  flex-wrap: wrap;
`

export const SpaceHeader = styled.div`
  --background-color: var(--background-shaded);
  --border-color: var(--c-layout-border);

  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
  padding: 0 20px;
  padding-top: 16px;
  border-bottom: 1px solid var(--border-color);
`

export const SpaceTypeHeader = styled.div<{ $expandedSidebar: boolean }>`
  ${({ $expandedSidebar }) => $expandedSidebar ? css`
  margin-left: 244px;
  `: css`
  margin-left: 86px;
  `}
`
