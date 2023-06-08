import React, { Ref } from 'react'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import rehypeHighlight from 'rehype-highlight/lib'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import styled from 'styled-components'

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
    margin-bottom: 24px;
  }

  h1 {
    margin-top: 3rem;
    margin-bottom: 1rem;
    font-size: 32px;
    color: #333333;
  }
  h2, h3, h4 {
    margin-top: 2.5rem;
    margin-bottom: 1rem;
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
`

export const Markdown = ({ docRef, data = '' }: { docRef: Ref<any>, data: string }) => {
  return (
    <div ref={docRef}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeHighlight, rehypeRaw]}
        >
        {data}
      </ReactMarkdown>
    </div>
  )
}
