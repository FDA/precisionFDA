import React from 'react'
import styled, { css } from 'styled-components'
import { breakPoints } from '../../styles/theme'

export const ToCItemWrap = styled.a<{ $level?: number }>`
  vertical-align: center;
  list-style: none;
  max-width: 30ch;
  text-wrap: pretty;
  box-sizing: border-box;
  border: 0 solid transparent;
  padding: 4px 0;
  ${({ $level }) => $level && `border-left-width: ${$level * 10}px;`}
  transition: color 0.2s ease-in-out;
`

export const ToCItem = styled.div`
  border-left: 2px solid transparent;
  padding-left: 3px;
  transition: border-color 0.2s ease-in-out;
  &:hover {
    border-left: 2px solid var(--primary-400);
  }
`

const StyledTOCTitle = styled.div`
  font-size: 12px;
  font-weight: bold;
  padding-bottom: 16px;
`

export const StyledToCWrap = styled.div<{ $sticky?: boolean }>`
  font-size: 14px;
  line-height: 20px;
  color: var(--c-text-500);
  padding-left: 12px;
  ${({ $sticky }) =>
    $sticky &&
    css`
      @media (min-width: ${breakPoints.large}px) {
        max-width: 380px;
        top: 32px;
        position: sticky;
        max-height: 80vh;
        height: fit-content;
      }
    `}
`

export const StyledToC = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  height: initial;
  overflow: initial;
  position: initial;
`

export interface IToCItem {
  id: string
  tagName: string
  textContent: string
}

export const TocList = ({ items }: { items?: IToCItem[] }) => {
  if (!items || items.length === 0) return null
  return (
    <StyledToC>
      {items.map((i, k) => {
        return (
          <ToCItemWrap key={`${i.id}-${k}`} href={`#${i.id}`} $level={parseInt(i.tagName[1], 10) - 2}>
            <ToCItem>{i.textContent}</ToCItem>
          </ToCItemWrap>
        )
      })}
    </StyledToC>
  )
}

export const ToC = ({ items, sticky = false }: { items?: IToCItem[]; sticky?: boolean }) => {
  return (
    <StyledToCWrap $sticky={sticky}>
      <StyledTOCTitle>Table of Contents</StyledTOCTitle>
      <TocList items={items} />
    </StyledToCWrap>
  )
}
