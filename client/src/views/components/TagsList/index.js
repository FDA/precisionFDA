import React from 'react'
import PropTypes from 'prop-types'

import './style.sass'


const Tag = ({ text }) =>
  <div className="pfda-tags-list__tag-item">{text}</div>

const TagsList = ({ tags }) =>
  <div className="pfda-tags-list">
    {tags.map((tag, index) => <Tag text={tag} key={index} />)}
  </div>

export default TagsList

Tag.propTypes = {
  text: PropTypes.string,
}

TagsList.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string),
}

TagsList.defaultProps = {
  tags: [],
}
