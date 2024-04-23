/* eslint-disable react/jsx-no-useless-fragment */
import React from 'react'
import ReactTooltip from 'react-tooltip'
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
      return <><span data-tip="FDA-restricted" data-for="fda-restricted">{Icon}</span><ReactTooltip id="fda-restricted" effect="solid" /></>
  }
  return isShown ? Icon : <></>
}
