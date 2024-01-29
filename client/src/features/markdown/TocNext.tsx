import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { breakPoints } from '../../styles/theme'
import { useScrollToHash } from '../../hooks/useScrollToHash'
import { compactScrollBarV2 } from '../../components/Page/styles'

export const ToCItemWrap = styled.a<{ $level?: number }>`
  vertical-align: center;
  box-sizing: content-box;
  list-style: none;
  max-width: 30ch;
  text-wrap: pretty;
  box-sizing: border-box;
  border: 0px solid transparent;
  border-left-width: 0px;
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

export const StyledToCWrap = styled.div`
  padding-left: 12px;
  @media (min-width: ${breakPoints.large}px) {
    max-width: 380px;
    top: 32px;
    position: sticky;
    max-height: 80vh;
    height: fit-content;
  }
`

export const StyledToC = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  height: initial;
  overflow: initial;
  position: initial;
`

export const TocPanel = styled.div`
  min-width: 230px;
  word-break: break-word;
  border: 1px solid var(--c-layout-border-200);
  padding: 10px 10px;
  padding-right: 2px;
  background-color: var(--tertiary-100);
  ${compactScrollBarV2}
  position: sticky;
  top: 32px;
  overflow-y: scroll;
  max-height: calc(80vh - 100px);
  box-shadow: 0 6px 6px rgb(0 0 0 / 8%);
  border-radius: 3px;
  margin-bottom: 20px;
`

export interface IToCItem {
  id: string
  tagName: string
  textContent: string
}

type SelectedElements = {
  id: string
  tagName: string
  textContent: string
}

export const setTocFromRef = (ref: any, set: (v: IToCItem[]) => void) => {
  const rest: SelectedElements[] = Array.from(ref?.current?.querySelectorAll('h1, h2, h3, h4, h5, h6') || [])

  set(
    rest.map(h => ({
      id: h.id,
      tagName: h.tagName,
      textContent: h.textContent,
    })),
  )
}

export const useMarkdownToc = (ref: React.MutableRefObject<null>, data: string) => {
  const [toc, setToc] = useState<IToCItem[]>()
  useScrollToHash()
  useEffect(() => {
    setTocFromRef(ref, setToc)
  }, [data, ref])

  return toc
}

export const TocList = ({ items }: { items?: IToCItem[] }) => {
  if(!items) return null
  return (
    <StyledToC>
        {items.map(i => {
          return (
            <ToCItemWrap key={i.id} href={`#${i.id}`} $level={parseInt(i.tagName[1], 10) - 2}>
              <ToCItem>{i.textContent}</ToCItem>
            </ToCItemWrap>
          )
        })}
      </StyledToC>
  )
}

export const ToC = ({ items }: { items?: IToCItem[] }) => {
  return (
    <StyledToCWrap>
      <StyledTOCTitle>Table of Contents</StyledTOCTitle>
      <TocList items={items} />
    </StyledToCWrap>
  )
}
