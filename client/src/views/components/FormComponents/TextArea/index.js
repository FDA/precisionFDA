import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'


const TextArea = ({ children, name, id, styleClasses, aria_label, ...rest }) => {
  const arialabel = aria_label ? aria_label : ''
  const classes = classNames({
    'form-control': true,
  }, styleClasses)
  return (
    <textarea
      id={id || name}
      name={name}
      className={classes}
      aria-label={arialabel}
      {...rest}
    >
      {children}
    </textarea>
  )
}

TextArea.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string,
  styleClasses: PropTypes.string,
  children: PropTypes.string,
  aria_label: PropTypes.string,
}

export default TextArea
