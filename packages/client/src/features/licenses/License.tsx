import clsx from 'clsx'
import styled from 'styled-components'
import { Markdown, MarkdownStyle } from '../../components/Markdown'
import type { License as ILicense } from './types'


const StyledTitle = styled.div`
  font-size: 24px;
  padding-left: 16px;
  padding-top: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--c-layout-border-200);
`

const StyledLicense = styled.div``

export const License = ({ license, className, link }: { license?: ILicense, className?: string, link?: string}) => {
  const classes = clsx({
    'home-license': true,
  }, className)

  return (
    <StyledLicense className={classes}>
      <StyledTitle data-testid="license-title">
        <a data-turbolinks="false" href={link} target='_blank' rel='noopener noreferrer'>{license?.title}</a>
      </StyledTitle>
      <MarkdownStyle data-testid="license-content"><Markdown data={license?.content} /></MarkdownStyle>
    </StyledLicense>
  )
}
