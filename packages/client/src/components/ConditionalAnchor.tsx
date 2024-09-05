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
}

export const ConditionalAnchor = ({ isAllowed, onViolation, children, href, dataMethod }: Props) => (isAllowed ? (
    <a href={href} data-method={dataMethod}>
      { children as any }
    </a>
  ) : (
    <div onClick={onViolation}>
      { children }
    </div>
  ))


type CloudResourcesConditionalAnchorProps = {
  children?: React.ReactNode
  href: string
  conditionType: CloudResourcesConditionType
}

export const CloudResourcesConditionalAnchor = ({ children, href, conditionType }: CloudResourcesConditionalAnchorProps) => {
  const { isAllowed, onViolation } = useCloudResourcesCondition(conditionType)
  return (
    <ConditionalAnchor
      href={href}
      isAllowed={isAllowed}
      onViolation={onViolation}
    >
      {children}
    </ConditionalAnchor>
  )  
}  
