import React, { Ref } from 'react'
import DOMPurify from 'dompurify'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import styled from 'styled-components'
import type { Components } from 'react-markdown'

export const MarkdownStyle = styled.div`
  padding: 16px;
  max-width: 800px;
  line-height: 24px;

  img {
    object-fit: cover;
    object-position: center;
    max-width: 100%;
  }

  p {
    margin-bottom: 16px;
    line-height: 1.7;
  }

  h1 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.25;
    color: var(--c-text-700);
    border-bottom: 1px solid var(--c-layout-border);
    padding-bottom: 0.5rem;
  }

  h2 {
    margin-top: 1.75rem;
    margin-bottom: 0.875rem;
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.3;
    color: var(--c-text-700);
  }

  h3 {
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.4;
    color: var(--c-text-700);
  }

  h4 {
    margin-top: 1.25rem;
    margin-bottom: 0.625rem;
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.4;
    color: var(--c-text-600);
  }

  h5 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.5;
    color: var(--c-text-600);
  }

  h6 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.5;
    color: var(--c-text-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  ul, ol {
    margin-bottom: 1.5rem;
    padding-left: 2rem;
  }

  ul {
    list-style-type: disc;
  }

  ul ul {
    list-style-type: circle;
    margin-bottom: 0;
    margin-top: 0.5rem;
  }

  ul ul ul {
    list-style-type: square;
  }

  ol {
    list-style-type: decimal;
  }

  ol ol {
    list-style-type: lower-alpha;
    margin-bottom: 0;
    margin-top: 0.5rem;
  }

  ol ol ol {
    list-style-type: lower-roman;
  }

  li {
    margin-bottom: 0.5rem;
    line-height: 1.7;
    color: var(--c-text-600);
  }

  li > p {
    margin-bottom: 0.5rem;
  }

  li:last-child {
    margin-bottom: 0;
  }

  code {
    padding: 2px 4px;
    font-size: 90%;
    color: #c7254e;
    background-color: #f9f2f4;
    border-radius: 3px;
  }

  pre {
    code {
      -webkit-text-size-adjust: 100%;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      box-sizing: border-box;
      overflow: auto;
      display: block;
      padding: 9.5px;
      margin: 0 0 10px;
      font-size: 13px;
      line-height: 1.428571429;
      word-break: break-all;
      word-wrap: break-word;
      color: #333333;
      background-color: #f5f5f5;
      border: 1px solid #ccc;
      border-radius: 3px;
      white-space: pre-line;
    }

  }

  table {
    width: 100%;
    margin-bottom: 1.5rem;
    border-collapse: collapse;
    border-spacing: 0;
    background: var(--background);
    border: 1px solid var(--c-layout-border);
    border-radius: 8px;
    overflow: hidden;
    font-size: 14px;
  }

  thead {
    background: var(--background-shaded-100);
  }

  th {
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    color: var(--c-text-700);
    border-bottom: 1px solid var(--c-layout-border);
    border-right: 1px solid var(--c-layout-border);
  }

  th:last-child {
    border-right: none;
  }

  td {
    padding: 12px 16px;
    color: var(--c-text-600);
    border-bottom: 1px solid var(--c-layout-border);
    border-right: 1px solid var(--c-layout-border);
  }

  td:last-child {
    border-right: none;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: var(--background-shaded-50);
  }

  tbody tr:nth-child(odd) {
    background: var(--background);
  }

  tbody tr:nth-child(even) {
    background: var(--background-shaded-50);
  }
`

interface MarkdownProps {
  docRef?: Ref<any>
  data?: string
  components?: Components
}

export const Markdown = ({ docRef, data = '', components }: MarkdownProps) => {
  return (
    <div ref={docRef}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeHighlight, rehypeRaw]}
        components={components}
        >
        {DOMPurify.sanitize(data)}
      </ReactMarkdown>
    </div>
  )
}
