/* eslint-disable react/jsx-no-useless-fragment */
import React from 'react'
import ReactTooltip from 'react-tooltip'
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
      return <><span data-tip="Protected" data-for="protected">{Icon}</span><ReactTooltip id="protected" effect="solid" /></>
  }
  return isShown ? Icon : <></>
}
