import { HOME_ENTRIES_TYPES } from '../../../constants'


const executionsState = {
  executions: [],
  isFetching: false,
  isCheckedAll: false,
  isExpandedAll: false,
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
}

const modalState = {
  isOpen: false,
  isLoading: false,
}

export default {
  [HOME_ENTRIES_TYPES.PRIVATE]: executionsState,
  [HOME_ENTRIES_TYPES.SPACES]: executionsState,
  [HOME_ENTRIES_TYPES.EVERYBODY]: executionsState,
  [HOME_ENTRIES_TYPES.FEATURED]: executionsState,
  executionDetails: {
    isFetching: false,
    execution: {},
    meta: {},
  },
  copyToSpaceModal: modalState,
  attachToModal: modalState,
  terminateModal: modalState,
  editTagsModal: modalState,
}
