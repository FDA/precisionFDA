import { HOME_FILE_TYPES } from '../../../constants'


const filesState = {
  files: [],
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
  [HOME_FILE_TYPES.PRIVATE]: filesState,
  [HOME_FILE_TYPES.FEATURED]: filesState,
  [HOME_FILE_TYPES.EVERYBODY]: filesState,
  [HOME_FILE_TYPES.SPACES]: filesState,
  isFetchFiles: false,
  renameModal: modalState,
  copyToSpaceModal: modalState,
  makePublicFolderModal: modalState,
  addFolderModal: modalState,
  deleteModal: modalState,
  filesAttachToModal: modalState,
  moveModal: {
    isOpen: false,
    isLoading: false,
    nodes: [{
      key: 0,
      title: '/',
    }],
  },
  attachLicenseModal: modalState,
  fileDetails: {
    isFetching: false,
    file: {},
    meta: {},
  },
  actionModal: {
    isOpen: false,
    isLoading: false,
    files: [],
  },
  editTagsModal: modalState,
  licenseModal: modalState,
  acceptLicenseModal: modalState,
}
