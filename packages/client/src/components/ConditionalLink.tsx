/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import { Link } from 'react-router-dom'
import { CloudResourcesConditionType, useCloudResourcesCondition } from '../hooks/useCloudResourcesCondition'

type Props = {
  isAllowed: boolean
  onViolation: () => void
  children?: React.ReactNode
  to: string
}

export const ConditionalLink = ({ isAllowed, onViolation, children, to }: Props) => (isAllowed ? (
    <Link to={to}>
      { children as any }
    </Link>
  ) : (
    <div onClick={onViolation}>
      { children }
    </div>
  ))


type CloudResourcesConditionalLinkProps = {
  children?: React.ReactNode
  to: string
  conditionType: CloudResourcesConditionType
}

export const CloudResourcesConditionalLink = ({ children, to, conditionType }: CloudResourcesConditionalLinkProps) => {
  const { isAllowed, onViolation } = useCloudResourcesCondition(conditionType)
  return (
    <ConditionalLink to={to} isAllowed={isAllowed} onViolation={onViolation}>
      {children}
    </ConditionalLink>
  )  
}  
