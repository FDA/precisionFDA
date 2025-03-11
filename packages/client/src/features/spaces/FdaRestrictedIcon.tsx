import React, { useId } from 'react'
import { Tooltip } from 'react-tooltip'
import styled from 'styled-components'
import { FdaIcon } from '../../components/icons/FdaIcon'

const StyledFdaRestrictedIcon = styled.span`
  flex-shrink: 0;
`

export const FdaRestrictedIcon = ({ color, showToolTip = true }: { color?: string; showToolTip?: boolean }) => {
  const tooltipId = useId()

  if (!showToolTip) return <FdaIcon color={color} />

  return (
    <>
      <StyledFdaRestrictedIcon data-tooltip-content="FDA-restricted" data-tooltip-id={`fda-restricted-${tooltipId}`}>
        <FdaIcon color={color} />
      </StyledFdaRestrictedIcon>
      <Tooltip id={`fda-restricted-${tooltipId}`} />
    </>
  )
}
