import { format } from 'date-fns'
import React from 'react'
import styled from 'styled-components'
import { ExpertDetails } from '../types'

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

export const ExpertBlog = ({
  expert,
  content,
}: {
  expert: ExpertDetails
  content: JSX.Element
}) => (
  <StyledBlogItem>
    <h1>{expert.blog_title}</h1>
    <ExpertName>{expert.title}</ExpertName>
    <ExpertDate>
      {format(new Date(expert.created_at), 'MMM dd, yyyy')}
    </ExpertDate>
    <div>{content}</div>
    <TextMuted>
      <hr />
      The views expressed are those of the author(s) and should not be construed
      to represent views or policies held by the FDA.
    </TextMuted>
  </StyledBlogItem>
)
