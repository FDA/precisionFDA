import React from 'react'
import styled, { css } from 'styled-components'
import { colors } from '../../styles/theme'
import { ActionFunctionsType, Link } from './types'

export const ActionItem = styled.li<{disabled?: boolean}>`
  padding: 0 20px;
  margin: 0;
  list-style: none;
  line-height: 23px;
  color: #272727;
  font-size: 14px;
  cursor: pointer;
  ${({disabled}) => disabled && css`
    color: #777777;
    cursor: not-allowed;
  `}
  &:hover {
    background: rgb(242,242,242);
  }
  a {
    color: #272727;
    display: inline-block;
    width: 100%;
  }
`
export const ActionMenu = styled.ul`
  margin: 0;
  padding: 4px 0px;
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: 3px;
`

export const StyledActionsMessage = styled.div`
  border-bottom: 1px solid rgba(0,0,0,0.15);
  max-width: 200px;
  padding: 0 20px;
  padding-bottom: 4px;
  font-style: italic;
  font-size: 14px;
  line-height: 23px;
  color: ${colors.textDarkGrey};
`

const LinkAction: React.FC<{ link: Link, disabled?: boolean }> = ({ children, link, disabled = false }) => {
  if(disabled) return <>{children}</>
  const url = typeof link === 'string' ? link : link.url
  const method = typeof link === 'string' ? 'GET' : link.method
  return (
    <a href={url} data-method={method}>{children}</a>
  )
}

export function ActionsDropdownContent({ actions, message }: { actions: ActionFunctionsType<any>, message?: React.ReactNode }) {
    const visibleActions = Object.keys(actions).filter(a => !actions[a]?.hide ?? true).map(v => ({ key: v, ...actions[v] }))
    return (
      <ActionMenu>
        {message &&
          <StyledActionsMessage>
            {message}
          </StyledActionsMessage>
        }
        {visibleActions.map(a => {
          return a?.link
          ? <ActionItem key={a.key} disabled={a?.isDisabled ?? true}><LinkAction disabled={a?.isDisabled} link={a.link}>{a.key}</LinkAction></ActionItem>
          :// @ts-ignore
          <ActionItem key={a.key} onClick={() => !a?.isDisabled && a?.func()} disabled={a?.isDisabled ?? true}>{a.key}</ActionItem>
        })}
      </ActionMenu>
    )
}

