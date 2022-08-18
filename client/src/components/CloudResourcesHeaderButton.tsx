import React from 'react'
import { HeaderButton } from '../features/home/show.styles'
import { CloudResourcesConditionType, useCloudResourcesCondition } from '../hooks/useCloudResourcesCondition'

type Props = {
  children?: React.ReactNode
  href: string
  isLinkDisabled?: boolean
  conditionType: CloudResourcesConditionType
}

export const CloudResourcesHeaderButton = ({ children, href, isLinkDisabled, conditionType }: Props) => {
  const { isAllowed, onViolation } = useCloudResourcesCondition(conditionType)
  return (isAllowed ? (
    <HeaderButton as="a" href={href} type="primary" disabled={isLinkDisabled}>
      { children }
    </HeaderButton>
  ) : (
    <HeaderButton onClick={onViolation} >
      { children }
    </HeaderButton>
  ))
}
