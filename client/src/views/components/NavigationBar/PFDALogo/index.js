import React from 'react'
import PropTypes from 'prop-types'

import precisionFDALight from './precisionFDA.white.png'
import precisionFDADark from './precisionFDA.dark.png'


const PFDALogoLight = ({ className }) => {
  return <img className={className} src={precisionFDALight} />
}

PFDALogoLight.propTypes = {
  className: PropTypes.string,
}

const PFDALogoDark = ({ className }) => {
  return <img className={className} src={precisionFDADark} />
}

PFDALogoDark.propTypes = {
  className: PropTypes.string,
}

export {
  PFDALogoLight,
  PFDALogoDark,
}
