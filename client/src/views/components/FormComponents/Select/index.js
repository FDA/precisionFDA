import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'


const Select = ({ name, id, lg, options, value, styleClasses, multiple, ...rest }) => {
  const classes = classNames({
    'form-control': true,
    'input-lg': lg,
  }, styleClasses)
  return (
    <select id={id || name} name={name} className={classes} multiple={multiple} value={value} {...rest}>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

const valuePropType = PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool])

Select.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: valuePropType,
    }),
  ),
  value: PropTypes.oneOfType([
    valuePropType,
    PropTypes.arrayOf(valuePropType),
  ]),
  name: PropTypes.string.isRequired,
  id: PropTypes.string,
  lg: PropTypes.bool,
  multiple: PropTypes.bool,
  styleClasses: PropTypes.string,
}

export default Select
