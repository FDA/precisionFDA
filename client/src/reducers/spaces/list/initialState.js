import { SPACE_TYPE_CARD } from '../../../constants'


export default {
  viewType: SPACE_TYPE_CARD,
  sortType: null,
  sortDirection: null,
  searchString: '',
  isFetching: true,
  entries: [],
  pagination: {
    currentPage: 1,
    nextPage: null,
    prevPage: null,
    totalPages: 1,
  },
}
