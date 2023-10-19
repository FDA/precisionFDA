import React from 'react'
import { NavLink } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { CloudResourcesConditionalAnchor } from '../../components/ConditionalAnchor'
import { CloudResourcesConditionType } from '../../hooks/useCloudResourcesCondition'
import { colors } from '../../styles/theme'
import { ActionFunctionsType, Link as LinkType } from './types'

// Updated disbaled text color for remediation using textMediumGrey
export const StyledActionItem = styled.li<{ disabled?: boolean }>`
  padding: 0 20px;
  margin: 0;
  list-style: none;
  line-height: 23px;
  color: #272727;
  font-size: 14px;
  cursor: pointer;

  a {
    color: #272727;
    display: inline-block;
    width: 100%;
  }

  ${({ disabled }) =>
    disabled &&
    css`
      color: ${colors.textMediumGrey};
      cursor: not-allowed;
      a {
        cursor: not-allowed;
        /* pointer-events: none; */
        color: ${colors.textMediumGrey};
      }
    `}
  &:hover {
    background: rgb(242, 242, 242);
  }
`

const StyledNavLink = styled.a``

export const ActionMenu = styled.ul`
  margin: 0;
  padding: 4px 0px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 3px;
`

export const StyledActionsMessage = styled.div`
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  max-width: 200px;
  padding: 0 20px;
  padding-bottom: 4px;
  font-style: italic;
  font-size: 14px;
  line-height: 23px;
  color: ${colors.textDarkGrey};
`

const LinkAction = ({
  children,
  link,
  disabled = false,
  cloudResourcesConditionType,
}: {
  link: LinkType
  disabled?: boolean
  cloudResourcesConditionType?: CloudResourcesConditionType
  children: React.ReactNode
}) => {
  if (disabled) {
    return children
  }
  const url = typeof link === 'string' ? link : link.url
  const method = typeof link === 'string' ? 'GET' : link.method
  return cloudResourcesConditionType ? (
    <CloudResourcesConditionalAnchor
      href={url}
      data-turbolinks="false"
      dataMethod={method}
      conditionType={cloudResourcesConditionType}
    >
      {children}
    </CloudResourcesConditionalAnchor>
  ) : (
    <a data-turbolinks="false" href={url} data-method={method}>
      {children}
    </a>
  )
}

const ActionItem = ({
  action,
}: {
  action: ActionFunctionsType<any>[number]
}) => {
  const isDisabled = action?.isDisabled ?? true
  switch (action?.type) {
    case 'route':
      return (
        <StyledActionItem key={action.key} disabled={isDisabled}>
          {isDisabled ? (
            <span>{action.key}</span>
          ) : (
            <NavLink to={action?.to} exact>
              {action.key}
            </NavLink>
          )}
        </StyledActionItem>
      )
    case 'link':
      return (
        <StyledActionItem
          key={action.key}
          disabled={action?.isDisabled ?? true}
        >
          <LinkAction
            disabled={action?.isDisabled}
            link={action?.link}
            cloudResourcesConditionType={action?.cloudResourcesConditionType}
          >
            {action.key}
          </LinkAction>
        </StyledActionItem>
      )
    case 'modal':
    default:
      return (
        <StyledActionItem
          key={action?.key}
          onClick={() => !action?.isDisabled && action?.func()}
          disabled={action?.isDisabled ?? true}
        >
          {action?.key}
        </StyledActionItem>
      )
  }
}

export function ActionsDropdownContent({
  actions,
  message,
}: {
  actions: ActionFunctionsType<any>
  message?: React.ReactNode
}) {
  const visibleActions = Object.keys(actions)
    .filter(a => !actions[a]?.shouldHide ?? true)
    .map(v => ({ key: v, ...actions[v] }))
  return (
    <ActionMenu>
      {message && <StyledActionsMessage>{message}</StyledActionsMessage>}
      {/* TODO - fix "any" cast */}
      {visibleActions.map(a => (
        <ActionItem key={a.key} action={a as any} />
      ))}
    </ActionMenu>
  )
}
