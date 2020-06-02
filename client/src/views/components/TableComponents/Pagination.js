import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import { PaginationShape } from '../../shapes/PaginationShape'


const getPages = ({ currentPage, nextPage, prevPage, totalPages }) => {
  const pages = []
  let pagesToShow = 5
  let startFromNumber = 1

  if (prevPage) {
    pages.push({
      label: 'prev',
      value: prevPage,
    })
  }

  if (totalPages <= pagesToShow) {
    pagesToShow = totalPages
  } else {
    if (currentPage + Math.floor((pagesToShow - 1) / 2) >= totalPages) {
      startFromNumber = totalPages - (pagesToShow - 1)
    } else {
      startFromNumber = currentPage - Math.floor(pagesToShow / 2)
    }
  }

  for (let i = 1; i <= pagesToShow; i++) {
    const num = startFromNumber++
    pages.push({
      label: num,
      value: num,
      isActive: num === currentPage,
    })
  }

  if (nextPage) {
    pages.push({
      label: 'next',
      value: nextPage,
    })
  }

  return pages
}

const Page = ({ page, setPageHandler }) => {
  const classes = classNames({
    'pfda-pagination__page--active': page.isActive,
  }, 'pfda-pagination__page')

  const onClick = () => {
    if (page.isActive) return false
    setPageHandler(page.value)
  }

  return (
    <a onClick={onClick} className={classes}>{page.label}</a>
  )
}

const Pagination = ({ data, setPageHandler }) => {
  const showPages = data.totalPages > 1
  return (
    <div className="pfda-pagination">
      {(showPages) && getPages(data).map((page, index) => (
        <Page key={index} page={page} setPageHandler={setPageHandler} />
      ))}
    </div>
  )
}

export default Pagination

Pagination.propTypes = {
  data: PropTypes.exact(PaginationShape),
  setPageHandler: PropTypes.func,
}

Page.propTypes = {
  page: PropTypes.exact({
    label: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    value: PropTypes.number,
    isActive: PropTypes.bool,
  }),
  setPageHandler: PropTypes.func,
}
