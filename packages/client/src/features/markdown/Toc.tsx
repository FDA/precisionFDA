import type React from 'react'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useScrollToHash } from '@/hooks/useScrollToHash'
import { breakPoints } from '@/styles/theme'

export const ToCItem = styled.li<{ $level?: number }>`
  list-style: none;
  padding-bottom: 8px;
  ${({ $level = 0 }) => ($level > 0 ? `margin-left: ${$level * 16}px;` : '')}
`

export const StyledToC = styled.div`
  flex: 1;
  font-size: 14px;
  overflow-wrap: break-word;

  @media (min-width: ${breakPoints.large}px) {
    max-width: 380px;
    box-shadow: 0px 2px 8px -4px rgba(0, 0, 0, 0.75);
    padding: 16px 10px 16px 16px;
    overflow-y: auto;
    /* 30px of breathing room below the header, tracking any alert strips above it */
    top: calc(var(--spacing-below-header) + 30px);
    position: sticky;
    max-height: 450px;
  }
`

export interface IToCItem {
  id: string
  tagName: string
  textContent: string
}

export const setTocFromRef = (
  ref: React.RefObject<HTMLElement | null>,
  set: React.Dispatch<React.SetStateAction<IToCItem[] | undefined>>,
) => {
  // Remove the first H1 from table of contents list becuase it's the page title.
  const rest = Array.from(ref?.current?.querySelectorAll('h1, h2, h3, h4, h5, h6') || [])

  set(
    rest.map(h => ({
      id: h.id,
      tagName: h.tagName,
      textContent: h.textContent || '',
    })),
  )
}

export const useMarkdownToc = (ref: React.RefObject<HTMLElement | null>, data: string) => {
  const [toc, setToc] = useState<IToCItem[]>()
  useScrollToHash(data)
  useEffect(() => {
    setTocFromRef(ref, setToc)
  }, [data, ref])

  return toc
}

export const ToC = ({ items }: { items: IToCItem[] }) => {
  return (
    <StyledToC>
      <div>
        {items?.map(i => {
          return (
            <a key={i.id} href={`#${i.id}`}>
              <ToCItem $level={parseInt(i.tagName[1], 10) - 1}>{i.textContent}</ToCItem>
            </a>
          )
        })}
      </div>
    </StyledToC>
  )
}
