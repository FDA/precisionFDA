import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import 'highlight.js/styles/github.css'
import React, { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import styled from 'styled-components'
import { useScrollToHash } from '../../../hooks/useScrollToHash'
import { IToCItem, setTocFromRef } from '../../markdown/Toc'
import { TocList, TocPanel } from '../../markdown/TocNext'
import { DocBody, DocRow } from '../styles'
import { LWrap, Loader } from '../../../components/Loader'

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

const LazyImage = (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return <img {...props} alt={props.alt} loading="lazy" />
}

export const useTutorialFileQuery = (fileName: string) =>
  useQuery({
    queryKey: ['markdown', fileName],
    queryFn: () => axios.get(`/tuts/${fileName}`).then(r => r.data as string),
  })

const Markdown = ({ data, setToc }: any) => {
  const docRef = useRef(null)
  useEffect(() => {
    setTocFromRef(docRef, setToc)
  }, [data])

  return (
    <StyledMarkdown ref={docRef}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeHighlight, rehypeRaw]}
        transformImageUri={i => i.replace('./', '/tuts/')}
        components={{
          img: LazyImage,
        }}
      >
        {data || ''}
      </ReactMarkdown>
    </StyledMarkdown>
  )
}


export const TutorialMarkdown = ({ fileName }: { fileName: string }) => {
  const { data, isLoading, isFetched } = useTutorialFileQuery(fileName)
  const [toc, setToc] = useState<IToCItem[]>()

  useScrollToHash(isFetched)

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

  return (
    <DocRow>
      <DocBody>
        {isLoading && <LWrap><Loader /></LWrap>}
        <Markdown data={data} setToc={setToc} />
      </DocBody>
      {toc && toc.length > 0 && <TocPanel><TocList items={toc} /></TocPanel>}
    </DocRow>
  )
}
