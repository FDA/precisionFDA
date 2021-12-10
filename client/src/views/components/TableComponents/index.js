import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import Icon from '../Icon'
import { SORT_ASC } from '../../../constants'
import './style.sass'


const Th = ({ children, type, sortType, sortDir, sortHandler, class_name }) => {
  const isSorted = sortType && type == sortType
  const classes = classNames({
    'pfda-table-components__th': true,
    'pfda-table-components__th--sortable': type,
    'pfda-table-components__th--sorted': isSorted,
  }, class_name)
  const iconType = (sortDir === SORT_ASC) ? 'fa-sort-alpha-asc' : 'fa-sort-alpha-desc'

  const onClick = () => {
    if (typeof sortHandler === 'function') sortHandler(type)
    return false
  }

  return (
    <th className={classes} onClick={onClick}>
      {(isSorted) && <Icon icon={iconType} />}
      {children}
    </th>
  )
}

const Tbody = ({ children }) => <tbody>{children}</tbody>

const Thead = ({ children }) =>
  <thead>
    <tr>{children}</tr>
  </thead>

const Table = ({ children }) => (
  <table className="pfda-table-components">
    {children}
  </table>
)

export {
  Table,
  Tbody,
  Thead,
  Th,
}

Table.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.element), PropTypes.element]),
}

Tbody.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.element), PropTypes.element]),
}

Thead.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.element), PropTypes.element]),
}

Th.propTypes = {
  children: PropTypes.string,
  type: PropTypes.string,
  sortType: PropTypes.string,
  sortDir: PropTypes.string,
  sortHandler: PropTypes.func,
  class_name: PropTypes.string,
}
