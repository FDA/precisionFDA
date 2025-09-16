import React, { useEffect, useMemo } from 'react'
import styled from 'styled-components'
import DOMPurify from 'dompurify'
import { useScrollToHash } from '../../hooks/useScrollToHash'

const Content = styled.div``

function generateId(text: string): string {
  const sanitizedText = DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })

  return (
    sanitizedText
      .toLowerCase()
      // Remove special characters and punctuation
      .replace(/[^\w\s-]/g, '')
      // Replace multiple spaces with single hyphens
      .replace(/\s+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '')
  )
}

function addIdsToHtmlContent(htmlContent: string | null | undefined): string {
  // Return empty string if content is null or undefined
  if (!htmlContent) {
    return ''
  }

  // Regular expression to match heading tags
  const headingRegex = /<(h[1-6])(\s[^>]*)?>(.*?)<\/h[1-6]>/gi

  const processedContent = htmlContent.replace(headingRegex, (match, tag, attributes, content) => {
    // Check if the heading already has an id attribute
    const hasId = attributes && /\sid\s*=/i.test(attributes)

    if (hasId) {
      return match // Return unchanged if ID already exists
    }

    // Extract text content and generate ID
    const textContent = content.replace(/<[^>]*>/g, '').trim()
    const id = generateId(textContent)

    const updatedAttributes = attributes ? `${attributes} id="${id}"` : ` id="${id}"`
    return `<${tag}${updatedAttributes}>${content}</${tag}>`
  })

  return DOMPurify.sanitize(processedContent)
}

export function AddIdsToHeaders({
  docRef,
  content,
  as = 'div',
  onHeadersUpdated,
}: {
  docRef: React.RefObject<HTMLDivElement | null>
  content: string | null | undefined
  as?: React.ElementType
  onHeadersUpdated: (headings: NodeListOf<Element>) => void
}) {
  const processedContent = useMemo(() => {
    return addIdsToHtmlContent(content)
  }, [content])

  useScrollToHash(docRef)

  useEffect(() => {
    // Use setTimeout to ensure the DOM is fully updated after dangerouslySetInnerHTML
    const timeoutId = setTimeout(() => {
      if (docRef.current) {
        const headings = docRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6')
        onHeadersUpdated(headings)
      }
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [docRef, processedContent, onHeadersUpdated])

  return <Content as={as} ref={docRef} dangerouslySetInnerHTML={{ __html: processedContent }} />
}
