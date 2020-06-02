export default {
  data: {},
  isFetching: true,
  isSideMenuHidden: false,
  isAccepting: false,
  lockSpaceModal: {
    isOpen: false,
    isLoading: false,
  },
  unlockSpaceModal: {
    isOpen: false,
    isLoading: false,
  },
  deleteSpaceModal: {
    isOpen: false,
    isLoading: false,
  },
  spaceAddDataModal: {
    isOpen: false,
    isLoading: false,
    dataType: null,
    isCheckedAll: false,
  },
  fileTree: {
    nodes: [{
      key: 0,
      title: '/',
      isLeaf: false,
      checkable: false,
    }],
  },
  accessibleSpaces: [],
  accessibleSpacesLoading: false,
  accessibleFiles: [],
  accessibleFilesLoading: false,
  accessibleApps: [],
  accessibleAppsLoading: false,
  accessibleWorkflows: [],
  accessibleWorkflowsLoading: false,
}
