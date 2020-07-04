import React from 'react'
import PropTypes from 'prop-types'


const LinkTargetBlank = ({ url, children }) => {
  return (
    <a href={url} target='_blank' rel='noopener noreferrer'>
      {children}
    </a>
  )
}

export default LinkTargetBlank

LinkTargetBlank.propTypes = {
  url: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
    PropTypes.string,
  ]),
}
