/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import { CloudResourcesConditionType, useCloudResourcesCondition } from '../hooks/useCloudResourcesCondition'

type Props = {
  isAllowed: boolean
  onViolation: () => void
  children?: React.ReactNode
  href: string
  dataMethod?: 'GET' | 'POST'
  style?: React.CSSProperties
  className?: string
}

export const ConditionalAnchor = ({ isAllowed, onViolation, children, href, dataMethod, style, className }: Props) => (isAllowed ? (
    <a href={href} data-method={dataMethod} style={style} className={className}>
      { children }
    </a>
  ) : (
    <div onClick={onViolation} style={style} className={className}>
      { children }
    </div>
  ))


type CloudResourcesConditionalAnchorProps = {
  children?: React.ReactNode
  href: string
  conditionType: CloudResourcesConditionType
  style?: React.CSSProperties
  className?: string
}

export const CloudResourcesConditionalAnchor = ({ children, href, conditionType, style, className }: CloudResourcesConditionalAnchorProps) => {
  const { isAllowed, onViolation } = useCloudResourcesCondition(conditionType)
  return (
    <ConditionalAnchor
      href={href}
      style={style}
      isAllowed={isAllowed}
      onViolation={onViolation}
      className={className}
    >
      {children}
    </ConditionalAnchor>
  )  
}  
