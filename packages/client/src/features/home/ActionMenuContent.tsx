import React from 'react'
import styled from 'styled-components'
import { CloudResourcesConditionalAnchor } from '../../components/ConditionalAnchor'
import { CheckIcon } from '../../components/icons/CheckIcon'
import { NavLink } from '../../components/NavLink'
import { colors } from '../../styles/theme'
import { Action, FunctionAction, LinkAction as LinkActionType, ModalAction, RouteAction, SelectionAction } from './action-types'
import { ActionsMenu } from '../../components/Menu'

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

export const StyledActionsMessage = styled.div`
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  max-width: 200px;
  padding: 0 20px 4px;
  font-style: italic;
  font-size: 14px;
  line-height: 23px;
  color: var(--c-text-700);
`

const ActionItem = ({ action }: { action: Action }) => {
  const isDisabled = action?.isDisabled ?? false

  switch (action?.type) {
    case 'route': {
      const routeAction = action as RouteAction
      return (
        <ActionsMenu.Item key={action.name} disabled={isDisabled} render={<NavLink to={routeAction.to}>{action.name}</NavLink>} />
      )
    }
    case 'link': {
      const linkAction = action as LinkActionType
      const url = typeof linkAction.link === 'string' ? linkAction.link : linkAction.link.url
      const method = typeof linkAction.link === 'string' ? 'GET' : linkAction.link.method
      if (linkAction.cloudResourcesConditionType) {
        return (
          <ActionsMenu.Item
            key={action.name}
            disabled={isDisabled}
            render={
              <CloudResourcesConditionalAnchor
                href={url}
                data-turbolinks="false"
                conditionType={linkAction.cloudResourcesConditionType}
              >
                {action.name}
              </CloudResourcesConditionalAnchor>
            }
          />
        )
      }
      return (
        <ActionsMenu.Item
          key={action.name}
          disabled={isDisabled}
          render={
            <a data-turbolinks="false" href={url} data-method={method}>
              {action.name}
            </a>
          }
        />
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
