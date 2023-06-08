import React from 'react'
import styled from 'styled-components'

import precisionFDALight from '../../../assets/precisionFDA.white.svg'
import precisionFDADark from '../../../assets/precisionFDA.dark.svg'

const StyledImg = styled.img`
  height: 40px;
`

export const PFDALogoLight = ({ className='' }) => {
  return <StyledImg className={className} src={precisionFDALight} style={{ color: '#ffffff' }}/>
}

export const PFDALogoDark = ({ className='' }) => {
  return <StyledImg className={className} src={precisionFDADark} alt='PFDA Dark logo to navigate to home page' />
}
