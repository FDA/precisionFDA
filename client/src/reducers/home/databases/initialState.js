import { HOME_DATABASE_TYPES } from '../../../constants'


const databasesState = {
  databases: [],
  isFetching: false,
  isCheckedAll: false,
  filters: {
    sortType: null,
    sortDirection: null,
    currentPage: 1,
    nextPage: null,
    prevPage: null,
    totalPages: null,
    totalCount: null,
    fields: new Map(),
  },
  path: [],
}

const modalState = {
  isOpen: false,
  isLoading: false,
}

export default {
  [HOME_DATABASE_TYPES.PRIVATE]: databasesState,
  [HOME_DATABASE_TYPES.SPACES]: databasesState,
  databaseDetails: {
    isFetching: false,
    database: {},
    meta: {},
  },
  copyToSpaceModal: modalState,
  editTagsModal: modalState,
  editDatabaseInfoModal: modalState,
  runActionModal: modalState,
}
