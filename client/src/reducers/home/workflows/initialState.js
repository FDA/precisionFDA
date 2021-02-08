import { HOME_WORKFLOW_TYPES } from '../../../constants'


const defaultWorkspaceFilters = {
  fields: new Map(),
  sortType: null,
  sortDirection: null,
  currentPage: 1,
  nextPage: null,
  prevPage: null,
  totalPages: null,
  totalCount: null,
}

const defaultWorkspaceTabState = {
  workflows: [],
  isFetching: false,
  isCheckedAll: false,
  isChecked: false,
  filters: defaultWorkspaceFilters,
}

const defaultWorkspaceModalState = {
  isOpen: false,
  isLoading: false,
}

export default {
  [HOME_WORKFLOW_TYPES.PRIVATE]: defaultWorkspaceTabState,
  [HOME_WORKFLOW_TYPES.FEATURED]: defaultWorkspaceTabState,
  [HOME_WORKFLOW_TYPES.EVERYONE]: defaultWorkspaceTabState,
  [HOME_WORKFLOW_TYPES.SPACES]: defaultWorkspaceTabState,
  isFetchingWorkflows: false,
  featureModal: defaultWorkspaceModalState,
  unfeatureModal: defaultWorkspaceModalState,
  forkModal: defaultWorkspaceModalState,
  exportToModal: defaultWorkspaceModalState,
  copyToSpaceModal: defaultWorkspaceModalState,
  makePublicModal: defaultWorkspaceModalState,
  attachToModal: defaultWorkspaceModalState,
  deleteModal: defaultWorkspaceModalState,
  runWorkflowModal: defaultWorkspaceModalState,
  runBatchWorkflowModal: defaultWorkspaceModalState,
  editTagsModal: defaultWorkspaceModalState,
  workflowDetails: {
    isFetching: false,
    workflow: {},
    meta: {},
  },
}
