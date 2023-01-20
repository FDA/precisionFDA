import styled, { css } from 'styled-components'
import { Button } from '../../../components/Button'
import { Svg } from '../../../components/icons/Svg'
import { colors, fontSize, fontWeight } from '../../../styles/theme'

const marginBottom = css`
  margin-bottom: 16px;
`

export const SpaceMainInfo = styled.div`
  display: flex;
  flex-direction: column;
  ${marginBottom}
  max-width: 410px;
`

export const SpaceHeaderDescrip = styled.div`
  font-size: 14px;
  color: ${colors.textMediumGrey};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;

  ${Svg} {
    margin-right: 8px;
  }
`

export const SpaceHeaderTitle = styled.div`
  font-size: ${fontSize.bannerTitle};
  font-weight: ${fontWeight.medium};
  color: ${colors.textDarkGrey};
  margin: auto 0;
  margin-bottom: 8px;
  display: inline-block;

  svg {
    margin-left: 8px;
  }
`

export const ActionButton = styled(Button)`
  color: ${colors.primaryBlue};
  background: ${colors.subtleBlue};
  border-color: ${colors.lightBlue};

  &:hover {
    background: white;
  }
`

export const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  height: 32px;
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
export const Tab = styled.div<{ isactive?: string }>`
  font-size: 14px;
  font-weight: 600;
  box-sizing: border-box;
  background: ${colors.inactiveTab};
  border-width: 1px 1px 1px 1px;
  border-style: solid;
  border-color: ${colors.borderDefault};
  border-radius: 4px 4px 0px 0px;
  padding: 6px 20px;
  color: ${colors.textDarkGreyInactive};
  cursor: pointer;
  flex: 1 0 auto;

  ${({ isactive }) => isactive &&
    css`
      background: white;
      border-bottom: 0;
      color: ${colors.textDarkGrey};
    `}
`
export const TransparentTab = styled(Tab)`
  border: none;
  background: transparent;
  cursor: initial;
  color: ${colors.textDarkGrey};
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
  display: flex;
  flex-direction: column;
  background-color: ${colors.shadedBg};
  padding: 0 20px;
  padding-top: 16px;
  border-bottom: 1px solid ${colors.borderDefault};
`

export const SpaceTypeHeader = styled.div<{ expandedSidebar: boolean }>`
  ${({ expandedSidebar }) => expandedSidebar ? css`
  margin-left: 244px;
  `: css`
  margin-left: 86px;
  `}
`
