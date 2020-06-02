import React from 'react'
import PropTypes from 'prop-types'


 const Tag = ({ text }) =>
  <div className="spaces-list-card__tag">{text}</div>

export default Tag

Tag.propTypes = {
  text: PropTypes.string,
}
