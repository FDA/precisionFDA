import { HOME_ENTRIES_TYPES } from '../../../constants'


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

const modalState = {
  isOpen: false,
  isLoading: false,
}

const assetsState = {
  assets: [],
  isFetching: false,
  isCheckedAll: false,
  filters: filtersState,
}

export default {
  [HOME_ENTRIES_TYPES.PRIVATE]: assetsState,
  [HOME_ENTRIES_TYPES.FEATURED]: assetsState,
  [HOME_ENTRIES_TYPES.EVERYBODY]: assetsState,
  [HOME_ENTRIES_TYPES.SPACES]: assetsState,
  assetDetails: {
    isFetching: false,
    asset: {},
    meta: {},
  },
  editTagsModal: modalState,
  attachToModal: modalState,
  renameModal: modalState,
  deleteModal: modalState,
  downloadModal: modalState,
  attachLicenseModal: modalState,
  licenseModal: modalState,
  acceptLicenseModal: modalState,
}
