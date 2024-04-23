import { format } from 'date-fns'
import React, { useRef } from 'react'
import styled from 'styled-components'
import { Markdown, MarkdownStyle } from '../../../components/Markdown'
import { IUser } from '../../../types/user'
import { ExpertDetails } from '../types'
import { ExpertColumnRight } from './ExpertColumnRight'
import { ExpertPageRow } from './styles'
import { useMarkdownToc } from '../../markdown/Toc'

const ExpertName = styled.span`
  font-weight: bold;
  font-size: 14px;
  padding-right: 12px;

  a {
    color: #333333;
  }
`
const ExpertDate = styled.span`
  font-size: 13px;
  color: #646464;
`
const StyledBlogItem = styled.div`
  hr {
    margin: 20px 0;
  }
`

export const TextMuted = styled.div`
  color: #777777;
  font-size: 14px;
`

export const ExpertMarkdownStyle = styled(MarkdownStyle)`
  display: flex;
  padding: 0;
`

export const ExpertBlog = ({ expert, user }: { expert: ExpertDetails, user: IUser }) => {
  const docRef = useRef(null)
  const toc = useMarkdownToc(docRef, expert.blog)
  
  return (
    <ExpertPageRow>
      <StyledBlogItem>
        <h1>{expert.blog_title}</h1>
        <ExpertName>{expert.title}</ExpertName>
        <ExpertDate>
          {format(new Date(expert.created_at), 'MMM dd, yyyy')}
        </ExpertDate>
        <ExpertMarkdownStyle>
          <Markdown docRef={docRef} data={expert.blog} />
        </ExpertMarkdownStyle>
        <TextMuted>
          <hr />
          The views expressed are those of the author(s) and should not be
          construed to represent views or policies held by the FDA.
        </TextMuted>
      </StyledBlogItem>
      <ExpertColumnRight expert={expert} user={user} toc={toc} />
    </ExpertPageRow>
  )
}
