import React from 'react'
import styled, { css } from 'styled-components'
import { CloudResourcesConditionalAnchor } from '../../components/ConditionalAnchor'
import { CloudResourcesConditionType } from '../../hooks/useCloudResourcesCondition'
import { colors } from '../../styles/theme'
import { ActionFunctionsType, ActionGroupType, Link as LinkType } from './types'
import { CheckIcon } from '../../components/icons/CheckIcon'
import { NavLink } from '../../components/NavLink'
import MagicLink from './MagicPostLink'

// Updated disbaled text color for remediation using textMediumGrey
export const StyledActionItem = styled.li<{ disabled?: boolean, selected?: boolean }>`
  /* padding: 0 16px; */
  margin: 0;
  list-style: none;
  color: var(--c-text-700);
  cursor: pointer;
  a {
    color: var(--c-text-700);
    display: inline-block;
    width: 100%;
    &:hover {
      color: var(--c-text-700);
    }
  }

  ${({ disabled }) =>
    disabled &&
    css`
      color: var(--c-dropdown-menu-text-disabled);
      cursor: not-allowed;
      a {
        cursor: not-allowed;
        /* pointer-events: none; */
        color: var(--c-dropdown-menu-text-disabled);
      }
    `}
  ${({ selected }) => selected && css`
      font-weight: 600;
    `}
  &:hover {
    background: var(--tertiary-100);
  }
`

const StyledNavLink = styled.a``

const StyleSelection = styled.div`
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 8px;
`

const StyleSelectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
`

const StyleGroupActionTitle = styled.div`
  padding: 8px;
  line-height: 12px;
  color: var(--c-text-700);
  font-style: italic;
`

const GroupHorizontalSeparator = styled.hr`
  border-top: 1px solid rgba(0, 0, 0, 0.15);
  border-bottom: none;
  margin: 4px 0;
`

export const ActionMenu = styled.ul`
  margin: 0;
  padding: 4px 0px;
  width: max-content;
  max-height: 500px;
  overflow-y: auto;
  font-size: 14px;
  ${StyleSelection} {
    padding: 4px 30px 4px 0;
  }
  ${StyledActionItem} {
    line-height: 23px;
    padding: 0 20px;
  }
`

export const GroupActionMenu = styled.ul`
  margin: 0;
  padding: 4px 0px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 3px;
  max-height: 500px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 23px;
  min-width: 170px;

  ${StyleSelection} {
    padding: 0 30px 0 0;
  }
  ${StyledActionItem} {
    padding: 0 12px;
  }
`

export const StyledActionsMessage = styled.div`
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  max-width: 200px;
  padding: 0 20px;
  padding-bottom: 4px;
  font-style: italic;
  font-size: 14px;
  line-height: 23px;
  color: var(--c-text-700);
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

const ActionItem = ({ action }: { action: ActionFunctionsType<any>[number] }) => {
  const isDisabled = action?.isDisabled ?? true
  switch (action?.type) {
    case 'route':
      return (
        <StyledActionItem key={action.key} disabled={isDisabled}>
          {isDisabled ? (
            <span>{action.key}</span>
          ) : (
            <NavLink to={action?.to}>
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
    case 'selection':
      return (
        <StyledActionItem key={action?.key}
          onClick={() => {
            if (!action?.isDisabled) {
              action?.func(!action.isSelected)
            }
          }}
          disabled={action?.isDisabled ?? true}
          selected={ action.isSelected }
        >
          <StyleSelection>
            <StyleSelectionIcon>
              {action.isSelected && <CheckIcon color={colors.primaryBlue} height={12} />}
            </StyleSelectionIcon>
            {action?.title}
          </StyleSelection>
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

export function ActionsDropdownGroupContent({
  content,
}: {
  content: ActionGroupType[]
}) {
  return (
    <GroupActionMenu>
      {content.map((item, index) => {
        const visibleActions = Object.keys(item.actions)
          .filter(a => !item.actions[a]?.shouldHide ?? true)
          .map(v => ({ key: v, ...item.actions[v] }))
        return (
          <div key={item.title.toLowerCase().replace(/ /g, '-')}>
            {item?.title && <StyleGroupActionTitle>{item.title}</StyleGroupActionTitle>}
            {visibleActions.map(a => (
              <ActionItem key={a.key} action={a as any} />
            ))}
            {index !== content.length - 1 && <GroupHorizontalSeparator />}
          </div>
        )
      })}
    </GroupActionMenu>
  )
}
