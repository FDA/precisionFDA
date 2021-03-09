import PropTypes from 'prop-types'


const PaginationShape = {
  currentPage: PropTypes.number,
  nextPage: PropTypes.number,
  prevPage: PropTypes.number,
  totalPages: PropTypes.number,
  totalCount: PropTypes.number,
}

const mapToPagination = (data) => {
  return {
    currentPage: data.current_page,
    nextPage: data.next_page,
    prevPage: data.prev_page,
    totalPages: data.total_pages,
    totalCount: data.total_count,
  }
}

export default PaginationShape

export {
  PaginationShape,
  mapToPagination,
}
