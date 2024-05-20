import React from 'react'
import styled from 'styled-components'

import precisionFDALight from '../../../assets/precisionFDA.white.svg'
import precisionFDADark from '../../../assets/precisionFDA.dark.svg'

const StyledImg = styled.img`
  --c-logo: var(--base);
  height: 40px;
`

export const PFDALogoLight = ({ className='', ...rest }) => {
  return <StyledImg className={className} src={precisionFDALight} alt='PFDA Light logo' style={{ color: '#ffffff' }} {...rest}/>
}

export const PFDALogoDark = ({ className='', ...rest }) => {
  return <StyledImg className={className} src={precisionFDADark} alt='PFDA Dark logo' {...rest} />
}
