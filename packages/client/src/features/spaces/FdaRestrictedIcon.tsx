/* eslint-disable react/jsx-no-useless-fragment */
import React from 'react'
import { Tooltip } from 'react-tooltip'
import { FdaIcon } from '../../components/icons/FdaIcon'


export const FdaRestrictedIcon = ({
  color,
  isShown = true,
  showToolTip = true,
}: {
  color?: string
  isShown?: boolean
  showToolTip?: boolean
}) => {
  const Icon = <FdaIcon color={color} />
  if (showToolTip) {
      return <><span data-tooltip-content="FDA-restricted" data-tooltip-id="fda-restricted">{Icon}</span><Tooltip id="fda-restricted" /></>
  }
  return isShown ? Icon : <></>
}
