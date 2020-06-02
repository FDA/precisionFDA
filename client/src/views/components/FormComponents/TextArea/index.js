import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'


const TextArea = ({ children, name, id, styleClasses, ...rest }) => {
  const classes = classNames({
    'form-control': true,
  }, styleClasses)
  return (
    <textarea
      id={id || name}
      name={name}
      className={classes}
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
}

export default TextArea
