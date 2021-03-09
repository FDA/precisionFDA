import React from 'react'
import PropTypes from 'prop-types'

import './style.sass'


const Counters = ({ currentPage, nextPage, totalCount, count }) => {
  const from = nextPage ? (currentPage - 1) * count + 1 : totalCount - count + 1
  const to = nextPage? currentPage * count : totalCount

  return (
    <div className="pfda-table-counters">
      {`${from}-${to}/${totalCount}`}
    </div>
  )
}

Counters.propTypes = {
  currentPage: PropTypes.number,
  nextPage: PropTypes.number,
  totalCount: PropTypes.number,
  count: PropTypes.number,
}

export default Counters
