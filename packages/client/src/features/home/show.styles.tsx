import React from 'react'
import styled, { css } from 'styled-components'
import { Button } from '../../components/Button'
import { ArrowIcon } from '../../components/icons/ArrowIcon'
import { Svg } from '../../components/icons/Svg'
import { Loader } from '../../components/Loader'
import { theme } from '../../styles/theme'

export const MetadataSection = styled.div`
  border-top: 1px solid var(--c-layout-border);
  border-bottom: 1px solid var(--c-layout-border);
  padding: 10px 15px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const MetadataRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 24px;
`

export const MetadataItem = styled.div``

export const MetadataKey = styled.div`
  color: var(--c-text-400);
  font-weight: 400;
  text-transform: uppercase;
  white-space: nowrap;
  font-size: 14px;
  line-height: 20px;
`
export const MetadataVal = styled.div`
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
`

export const NotFound = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1rem;
  font-size: 18px;
  gap: 1rem;
`

export const ResourceTitle = styled.h1``
export const HeaderRight = styled.div``
export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`
export const ResourceHeader = styled.div`
  gap: 8px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 16px;
`
export const FilesListResourceHeader = styled(ResourceHeader)`
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;
`

export const Topbox = styled.div`
  margin-bottom: 40px;
`

export const StyledCloudResourcesHeaderButton = styled(Button).attrs({ 'data-variant': 'primary' })`
  gap: 8px;
  max-height: 34px;
  box-sizing: border-box;
  ${({ disabled }) =>
    disabled &&
    css`
      background-color: ${theme.colors.lightBlue};
      border-color: ${theme.colors.lightBlue};
      cursor: not-allowed;
      pointer-events: none;
    `}
`

export const Title = styled.div`
  display: inline-block;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`

export const Description = styled.div`
  font-size: 16px;
`
export const LockedRow = styled.div`
  font-size: 14px;
  background: ${theme.colors.lightYellow};
  border-radius: 4px;
  padding: 4px 7px;
  display: flex;
  align-items: center;
  width: fit-content;

  ${Svg} {
    margin-right: 6px;
  }
`

export const Pill = styled.div`
  border-radius: 10px;
  background-color: white;
  color: var(--primary-500);
  font-size: 0.7rem;
  font-weight: bold;
  padding: 1px 6px;
`

export const HomeLoader = styled(Loader)`
  justify-self: center;
`
export const StyledActionsButton = styled(Button)`
  gap: 6px;
`
export const ActionsButton = React.forwardRef((props: any, ref) => (
  <StyledActionsButton data-variant='primary' ref={ref} {...props}>
    Actions <ArrowIcon />
  </StyledActionsButton>
))

ActionsButton.displayName = 'ActionsButton'
