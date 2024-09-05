import React from 'react'
import { Link } from 'react-router-dom'
import { StyledCloudResourcesHeaderButton } from '../features/home/show.styles'
import { CloudResourcesConditionType, useCloudResourcesCondition } from '../hooks/useCloudResourcesCondition'

/** TODO after moving all href targets to React switch to Link for everything */
type Props = {
  children?: React.ReactNode
  href: string
  isLinkDisabled?: boolean
  conditionType: CloudResourcesConditionType
  asReactLink?: boolean
}

export const getAllowedButton = (children: React.ReactNode, href: string, isLinkDisabled?: boolean, asReactLink?: boolean) =>
  asReactLink ?
    (<Link to={href} >
      <StyledCloudResourcesHeaderButton disabled={isLinkDisabled}>
        {children}
      </StyledCloudResourcesHeaderButton>
    </Link>) :
    (<StyledCloudResourcesHeaderButton as="a" href={href} type="primary" disabled={isLinkDisabled}>
      {children}
    </StyledCloudResourcesHeaderButton>)

export const CloudResourcesHeaderButton = ({ children, href, isLinkDisabled, conditionType, asReactLink }: Props) => {
  const { isAllowed, onViolation } = useCloudResourcesCondition(conditionType)
  return (isAllowed ?
    getAllowedButton(children, href, isLinkDisabled, asReactLink)
    : (
      <StyledCloudResourcesHeaderButton onClick={onViolation} >
        {children}
      </StyledCloudResourcesHeaderButton>
    ))
}