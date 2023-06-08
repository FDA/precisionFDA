import React from 'react'
import classnames from 'classnames'
import { License as ILicense } from './types'
import styled from 'styled-components'
import { Markdown } from '../../../components/Markdown'


const StyledTitle = styled.div`
  font-size: 24px;
  padding-left: 16px;
  padding-top: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eeeeee;
`

const StyledLicense = styled.div``

export const License = ({ license, className, link }: { license: ILicense, className?: string, link?: string}) => {
  const classes = classnames({
    'home-license': true,
  }, className)

  return (
    <StyledLicense className={classes}>
      <StyledTitle>
        <a data-turbolinks="false" href={link} target='_blank' rel='noopener noreferrer'>{license?.title}</a>
      </StyledTitle>
      <Markdown data={license?.content} />
    </StyledLicense>
  )
}
