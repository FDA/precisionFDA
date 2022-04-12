import React from 'react'
import { Remarkable } from 'remarkable'
import { linkify } from 'remarkable/linkify'
import styled from 'styled-components'

const StyledMarkdown = styled.div`
  padding: 16px;
`

export const Markdown = ({ data = '', ...rest }: { data: string }) => {
  const md = new Remarkable('full', {
    typographer: true,
  }).use(linkify)

  return <StyledMarkdown dangerouslySetInnerHTML={{ __html: md.render(data) }} {...rest}></StyledMarkdown>
}
