import { HOME_APP_TYPES } from '../../../constants'


const filtersState = {
  sortType: null,
  sortDirection: null,
  currentPage: 1,
  nextPage: null,
  prevPage: null,
  totalPages: null,
  totalCount: null,
  fields: new Map(),
}

const appsState = {
  apps: [],
  isFetching: false,
  isCheckedAll: false,
  filters: filtersState,
}

const modalState = {
  isOpen: false,
  isLoading: false,
}

export default {
  [HOME_APP_TYPES.PRIVATE]: appsState,
  [HOME_APP_TYPES.FEATURED]: appsState,
  [HOME_APP_TYPES.EVERYBODY]: appsState,
  [HOME_APP_TYPES.SPACES]: appsState,
  appDetails: {
    isFetching: false,
    app: {},
    meta: {},
  },
  appExecutions: {
    jobs: [],
    isFetching: false,
    filters: filtersState,
  },
  copyToSpaceModal: modalState,
  assignToChallengeModal: modalState,
  editTagsModal: modalState,
  appsAttachToModal: modalState,
  comparisonModal: modalState,
  deleteModal: modalState,
}