import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { breakPoints } from '../../styles/theme'
import { useScrollToHash } from '../../hooks/useScrollToHash'

export const ToCItem = styled.li<{ $level?: number }>`
  list-style: none;
  padding-bottom: 8px;
  ${({ $level }) => $level && `margin-left: ${$level * 16}px;`}
`

export const StyledToC = styled.div`
    flex: 1;
    font-size: 14px;
    height: initial;
    overflow: initial;
    position: initial;
    word-wrap: break-word;

    @media (min-width: ${breakPoints.large}px) {
      box-sizing: border-box;
      max-width: 380px;
      box-shadow: 0px 2px 8px -4px rgba(0, 0, 0, 0.75);
      padding: 16px;
      padding-right: 10px;
      overflow-y: auto;
      top: 80px;
      position: sticky;
      max-height: 450px;
    }

`

export interface IToCItem {
  id: string
  tagName: string
  textContent: string
}

export const setTocFromRef = (ref, set) => {
  // Remove the first H1 from table of contents list becuase it's the page title.
  const rest = Array.from(
    ref?.current?.querySelectorAll('h1, h2, h3, h4, h5, h6') || [],
  )

  set(
    rest.map(h => ({
      id: h.id,
      tagName: h.tagName,
      textContent: h.textContent,
    })),
  )
}

export const useMarkdownToc = (ref: any, data: string) => {
  const [toc, setToc] = useState<IToCItem[]>()
  useScrollToHash()
  useEffect(() => {
    setTocFromRef(ref, setToc)
  }, [data, ref])

  return toc
}

export const ToC = ({
  items,
}: {
  items: IToCItem[]
}) => {
  return (
    <StyledToC>
      <div>
        {items?.map(i => {
          return (
            <a key={i.id} href={`#${i.id}`}>
              <ToCItem $level={parseInt(i.tagName[1], 10) - 1}>
                {i.textContent}
              </ToCItem>
            </a>
          )
        })}
      </div>
    </StyledToC>
  )
}
