import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import precisionFDALight from '../../../../assets/precisionFDA.white.png'
import precisionFDADark from '../../../../assets/precisionFDA.dark.png'


const StyledImg = styled.img`
  height: 40px;
`
StyledImg.defaultProps = {
  alt: 'PFDA Light logo to navigate to home page',
}
const PFDALogoLight = ({ className='' }) => {
  return <StyledImg className={className} src={precisionFDALight} />
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
