import React, { useId } from 'react'
import { Tooltip } from 'react-tooltip'
import styled from 'styled-components'
import { LockIcon } from '../../components/icons/LockIcon'

const StyledProtectedIcon = styled.span`
  flex-shrink: 0;
`

export const ProtectedIcon = ({ color, showToolTip = true }: { color?: string; showToolTip?: boolean }) => {
  const tooltipId = useId()

  if (!showToolTip) return <LockIcon color={color} />

  return (
    <>
      <StyledProtectedIcon data-tooltip-content="Space Data Protected" data-tooltip-id={`protected-${tooltipId}`}>
        <LockIcon color={color} />
      </StyledProtectedIcon>
      <Tooltip place={'bottom-start'} id={`protected-${tooltipId}`} />
    </>
  )
}
