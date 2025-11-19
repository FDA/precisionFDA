import React from 'react'
import styled, { css } from 'styled-components'
import { CloudResourcesConditionalAnchor } from '../../components/ConditionalAnchor'
import { CheckIcon } from '../../components/icons/CheckIcon'
import { NavLink } from '../../components/NavLink'
import { CloudResourcesConditionType } from '../../hooks/useCloudResourcesCondition'
import { colors } from '../../styles/theme'
import {
  Action,
  ActionGroup,
  FunctionAction,
  LinkAction as LinkActionType,
  Link as LinkType,
  ModalAction,
  RouteAction,
  SelectionAction,
} from './action-types'
import { ActionsMenu } from '../../components/Menu'

export const StyledActionItem = styled.li<{ disabled?: boolean; selected?: boolean }>`
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
        color: var(--c-dropdown-menu-text-disabled);
      }
    `}
  ${({ selected }) =>
    selected &&
    css`
      font-weight: 600;
    `}
  &:hover {
    background: var(--tertiary-100);
  }
`

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
    return <>{children}</>
  }
  const url = typeof link === 'string' ? link : link.url
  const method = typeof link === 'string' ? 'GET' : link.method
  return cloudResourcesConditionType ? (
    <CloudResourcesConditionalAnchor href={url} data-turbolinks="false" conditionType={cloudResourcesConditionType}>
      {children}
    </CloudResourcesConditionalAnchor>
  ) : (
    <a data-turbolinks="false" href={url} data-method={method}>
      {children}
    </a>
  )
}

const ActionItem = ({ action }: { action: Action }) => {
  const isDisabled = action?.isDisabled ?? false

  switch (action?.type) {
    case 'route': {
      const routeAction = action as RouteAction
      return (
        <ActionsMenu.Item key={action.name} disabled={isDisabled}>
          {isDisabled ? <span>{action.name}</span> : <NavLink to={routeAction.to}>{action.name}</NavLink>}
        </ActionsMenu.Item>
      )
    }
    case 'link': {
      const linkAction = action as LinkActionType
      return (
        <ActionsMenu.Item key={action.name} disabled={isDisabled}>
          <LinkAction
            disabled={isDisabled}
            link={linkAction.link}
            cloudResourcesConditionType={linkAction.cloudResourcesConditionType}
          >
            {action.name}
          </LinkAction>
        </ActionsMenu.Item>
      )
    }
    case 'selection': {
      const selectionAction = action as SelectionAction
      return (
        <ActionsMenu.CheckboxItem
          key={action.name}
          onCheckedChange={(checked: boolean) => {
            if (!isDisabled) {
              selectionAction.func(checked)
            }
          }}
          disabled={isDisabled}
          checked={selectionAction.isSelected}
        >
          <StyleSelection>
            <StyleSelectionIcon>
              {selectionAction.isSelected && <CheckIcon color={colors.primaryBlue} height={12} />}
            </StyleSelectionIcon>
            {selectionAction.title}
          </StyleSelection>
        </ActionsMenu.CheckboxItem>
      )
    }
    case 'modal': {
      const modalAction = action as ModalAction
      return (
        <ActionsMenu.Item key={action.name} onClick={() => !isDisabled && modalAction.func()} disabled={isDisabled}>
          {action.name}
        </ActionsMenu.Item>
      )
    }
    default: {
      const functionAction = action as FunctionAction
      return (
        <ActionsMenu.Item
          key={action.name}
          onClick={() => {
            if (!isDisabled) {
              functionAction.func()
            }
          }}
          disabled={isDisabled}
        >
          {functionAction?.children || action.name}
        </ActionsMenu.Item>
      )
    }
  }
}

export function ActionsMenuContent({ actions, message }: { actions: Action[]; message?: React.ReactNode }) {
  const visibleActions = actions.filter(action => !action.shouldHide)

  return (
    <>
      {message && <StyledActionsMessage>{message}</StyledActionsMessage>}
      {visibleActions.map(action => (
        <ActionItem key={action.name} action={action} />
      ))}
    </>
  )
}

export function ActionsMenuGroupContent({ content }: { content: ActionGroup[] }) {
  return (
    <GroupActionMenu>
      {content.map((item, index) => {
        const visibleActions = item.actions.filter(action => !action.shouldHide)
        return (
          <div key={item.title.toLowerCase().replace(/ /g, '-')}>
            {item?.title && <StyleGroupActionTitle>{item.title}</StyleGroupActionTitle>}
            {visibleActions.map(action => (
              <ActionItem key={action.name} action={action} />
            ))}
            {index !== content.length - 1 && <GroupHorizontalSeparator />}
          </div>
        )
      })}
    </GroupActionMenu>
  )
}
