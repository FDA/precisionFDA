import React, { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import styled from 'styled-components'
import 'highlight.js/styles/github.css'
import { DocBody, DocRow } from '../styles'
import { breakPoints } from '../../../styles/theme'
import { useScrollToHash } from '../../../hooks/useScrollToHash'

const StyledMarkdown = styled.div`
  img {
    object-fit: cover;
    object-position: center;
    max-width: 100%;
  }
  table {
    color:#666;
    font-size:12px;
    text-shadow: 1px 1px 0px #fff;
    background:#eaebec;
    margin:20px 0;
    border:#ccc 1px solid;
    border-radius:2px;
    box-shadow: 0 1px 2px #d1d1d1;
  }
  table th {
    padding: 10px;
    border-top:1px solid #fafafa;
    border-bottom:1px solid #e0e0e0;
    background: #ededed;
  }
  table th:first-child {
    text-align: left;
    padding-left:10px;
  }
  table tr:first-child th:first-child {
    border-top-left-radius:2px;
  }
  table tr:first-child th:last-child {
    border-top-right-radius:2px;
  }
  table tr {
    text-align: center;
    padding-left:10px;
  }
  table td:first-child {
    text-align: left;
    padding-left:10px;
    border-left: 0;
  }
  table td {
    padding:10px;
    border-top: 1px solid #ffffff;
    border-bottom:1px solid #e0e0e0;
    border-left: 1px solid #e0e0e0;
    background: #fafafa;
  }
  table tr.even td {
    background: #f6f6f6;
  }
  table tr:last-child td {
    border-bottom:0;
  }
  table tr:last-child td:first-child {
    border-bottom-left-radius:2px;
  }
  table tr:last-child td:last-child {
    border-bottom-right-radius:2px;
  }
`

export const useTutorialFileQuery = (fileName: string) =>
  useQuery({
    queryKey: ['markdown', fileName],
    queryFn: () => axios.get(`/tuts/${fileName}`).then(r => r.data as string),
  })

const Markdown = ({ data, setToc }: any) => {
  const docRef = useRef(null)
  useScrollToHash()
  useEffect(() => {
    // Remove the first H1 from table of contents list becuase it's the page title.
    const [, ...rest] = Array.from(
      docRef?.current?.querySelectorAll('h1, h2, h3, h4, h5, h6'),
    )
    setToc(
      rest.map(h => ({
        id: h.id,
        tagName: h.tagName,
        textContent: h.textContent,
      })),
    )
  }, [])
  return (
    <StyledMarkdown ref={docRef}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeHighlight, rehypeRaw]}
        transformImageUri={i => i.replace('./', '/tuts/')}
      >
        {data || ''}
      </ReactMarkdown>
    </StyledMarkdown>
  )
}

export const ToCItem = styled.li<{ level?: number }>`
  list-style: none;
  padding-bottom: 8px;
  ${({ level }) => level && `margin-left: ${level * 16}px;`}
`

export const ToC = styled.div`
  .container {
    font-size: 14px;
    height: initial;
    overflow: initial;
    position: initial;

    @media (min-width: ${breakPoints.large}px) {
      box-sizing: border-box;
      max-width: 380px;
      box-shadow: 0px 2px 8px -4px rgba(0, 0, 0, 0.75);
      padding: 16px;
      padding-right: 10px;
      overflow-y: auto;
      top: 80px;
      position: sticky;
      height: 450px;
    }
  }
`

interface IToCItem {
  id: string
  tagName: string
  textContent: string
}

export const TutorialMarkdown = ({ fileName }: { fileName: string }) => {
  const { data, isLoading } = useTutorialFileQuery(fileName)
  const [toc, setToc] = useState<IToCItem[]>()
  const containerRef = useRef<HTMLDivElement>(null)

  // Detect if we are scrolled to bottom
  // const [showFade, setShowFade] = useState(true)
  // useEffect(() => {
  //   const container = containerRef.current

  //   const handleScroll = () => {
  //     const hasSpaceToScroll = container?.scrollTop+10 < container?.scrollHeight - container?.clientHeight
  //     if (hasSpaceToScroll) {
  //       setShowFade(true)
  //       container?.classList.add('showFade')
  //     } else {
  //       setShowFade(false)
  //       container?.classList.remove('showFade')
  //     }
  //   }
  //   container?.addEventListener('scroll', handleScroll)
  //   return () => {
  //     container?.removeEventListener('scroll', handleScroll)
  //   }
  // }, [])

  if (isLoading) return <div>Loading...</div>
  return (
    <DocRow>
      <DocBody>
        <Markdown data={data} setToc={setToc} />
      </DocBody>
      {toc && (
        <ToC>
          <div ref={containerRef} className="container">
            {toc?.map(i => {
              return (
                <a key={i.id} href={`#${i.id}`}>
                  <ToCItem level={parseInt(i.tagName[1], 10) - 1}>
                    {i.textContent}
                  </ToCItem>
                </a>
              )
            })}
          </div>
        </ToC>
      )}
    </DocRow>
  )
}
