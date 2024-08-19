/* eslint-disable react/jsx-no-useless-fragment */
import React from 'react'
import { Tooltip } from 'react-tooltip'
import { LockIcon } from '../../components/icons/LockIcon'


export const ProtectedIcon = ({
  color,
  isShown = true,
  showToolTip = true,
}: {
  color?: string
  isShown?: boolean
  showToolTip?: boolean
}) => {
  const Icon = <LockIcon color={color} />
  if (showToolTip) {
      return <><span data-tooltip-content="Protected" data-tooltip-id="protected">{Icon}</span><Tooltip id="protected" /></>
  }
  return isShown ? Icon : <></>
}
