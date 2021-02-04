export default {
  links: {},
  entries: [],
  isCheckedAll: false,
  isFetching: true,
  addFolderModal: {
    isOpen: false,
    isLoading: false,
  },
  actionModal: {
    isOpen: false,
    isLoading: false,
    action: null,
    files: [],
  },
  renameModal: {
    isOpen: false,
    isLoading: false,
  },
  copyModal: {
    isOpen: false,
    isLoading: false,
    files: [],
    step: 1,
  },
  moveModal: {
    isOpen: false,
    isLoading: false,
    nodes: [{
      key: 0,
      title: '/',
    }],
  },
  sortType: null,
  sortDirection: null,
  pagination: {
    currentPage: 1,
    nextPage: null,
    prevPage: null,
    totalPages: 1,
  },
}
