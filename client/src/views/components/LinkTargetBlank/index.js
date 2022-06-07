import React from 'react'
import PropTypes from 'prop-types'


const LinkTargetBlank = ({ url, children, ariaLabel }) => {
  return (
    <a href={url} target='_blank' rel='noopener noreferrer' aria-label={ariaLabel}>
      {children}
    </a>
  )
}

export default LinkTargetBlank

LinkTargetBlank.propTypes = {
  url: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.array,
    PropTypes.element,
    PropTypes.string,
  ]),
  ariaLabel: PropTypes.string,
}
