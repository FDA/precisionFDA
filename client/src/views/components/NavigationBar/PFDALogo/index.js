import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import precisionFDALight from './precisionFDA.white.png'
import precisionFDADark from './precisionFDA.dark.png'


const StyledImg = styled.img`
  height: 40px;
`

const PFDALogoLight = ({ className='' }) => {
  return <StyledImg className={className} src={precisionFDALight} alt='PFDA Light logo to navigate to home page' />
}

PFDALogoLight.propTypes = {
  className: PropTypes.string,
}

const PFDALogoDark = ({ className='' }) => {
  return <StyledImg className={className} src={precisionFDADark} alt='PFDA Dark logo to navigate to home page' />
}

PFDALogoDark.propTypes = {
  className: PropTypes.string,
}

export {
  PFDALogoLight,
  PFDALogoDark,
}
