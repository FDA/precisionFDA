import { HOME_WORKFLOW_TYPES } from '../../../constants'


export const homeWorkflowsIsFetchWorkflowsSelector = (state) => state.home.workflows[HOME_WORKFLOW_TYPES.PRIVATE].isFetchingWorkflows
export const homeWorkflowsListSelector = (state) => state.home.workflows[HOME_WORKFLOW_TYPES.PRIVATE].workflows
export const homeWorkflowsIsCheckedAllSelector = (state) => state.home.workflows[HOME_WORKFLOW_TYPES.PRIVATE].isCheckedAll
export const homeWorkflowsIsFetchingSelector = (state) => state.home.workflows[HOME_WORKFLOW_TYPES.PRIVATE].isFetching
export const homeWorkflowsFiltersSelector = (state) => state.home.workflows[HOME_WORKFLOW_TYPES.PRIVATE].filters

export const homeWorkflowsFeaturedIsFetchWorkflowsSelector = (state) => state.home.workflows[HOME_WORKFLOW_TYPES.FEATURED].isFetchingWorkflows
export const homeWorkflowsFeaturedListSelector = (state) => state.home.workflows[HOME_WORKFLOW_TYPES.FEATURED].workflows
export const homeWorkflowsFeaturedIsCheckedAllSelector = (state) => state.home.workflows[HOME_WORKFLOW_TYPES.FEATURED].isCheckedAll
export const homeWorkflowsFeaturedIsFetchingSelector = (state) => state.home.workflows[HOME_WORKFLOW_TYPES.FEATURED].isFetching
export const homeWorkflowsFeaturedFiltersSelector = (state) => state.home.workflows[HOME_WORKFLOW_TYPES.FEATURED].filters

export const homeWorkflowsEveryoneIsFetchWorkflowsSelector = (state) => state.home.workflows[HOME_WORKFLOW_TYPES.EVERYONE].isFetchingWorkflows
export const homeWorkflowsEveryoneListSelector = (state) => state.home.workflows[HOME_WORKFLOW_TYPES.EVERYONE].workflows
export const homeWorkflowsEveryoneIsCheckedAllSelector = (state) => state.home.workflows[HOME_WORKFLOW_TYPES.EVERYONE].isCheckedAll
export const homeWorkflowsEveryoneIsFetchingSelector = (state) => state.home.workflows[HOME_WORKFLOW_TYPES.EVERYONE].isFetching
export const homeWorkflowsEveryoneFiltersSelector = (state) => state.home.workflows[HOME_WORKFLOW_TYPES.EVERYONE].filters

export const homeWorkflowsSpacesIsFetchWorkflowsSelector = (state) => state.home.workflows[HOME_WORKFLOW_TYPES.SPACES].isFetchingWorkflows
export const homeWorkflowsSpacesListSelector = (state) => state.home.workflows[HOME_WORKFLOW_TYPES.SPACES].workflows
export const homeWorkflowsSpacesIsCheckedAllSelector = (state) => state.home.workflows[HOME_WORKFLOW_TYPES.SPACES].isCheckedAll
export const homeWorkflowsSpacesIsFetchingSelector = (state) => state.home.workflows[HOME_WORKFLOW_TYPES.SPACES].isFetching
export const homeWorkflowsSpacesFiltersSelector = (state) => state.home.workflows[HOME_WORKFLOW_TYPES.SPACES].filters

export const homeWorkflowsMakePublicModalSelector = (state) => state.home.workflows.makePublicModal
export const homeCurrentTabSelector = (state) => state.home.workflows.currentTab
export const homeCurrentPageSelector = (state) => state.home.workflows.currentPage
export const homeAccessibleSpacesSelector = (state) => state.home.workflows.accessibleSpaces
export const homePageCountersSelector = (state) => state.home.workflows.counters
export const homePageAdminStatusSelector = (state) => state.home.workflows.adminStatus
export const homeWorkflowsCopyToSpaceModalSelector = (state) => state.home.workflows.copyToSpaceModal
export const homeWorkflowsDeleteModalSelector = (state) => state.home.workflows.deleteModal
export const homeWorkflowsRunModalSelector = (state) => state.home.workflows.runWorkflowModal
export const homeWorkflowsRunBatchModalSelector = (state) => state.home.workflows.runBatchWorkflowModal
export const homeWorkflowsAttachToModalSelector = (state) => state.home.workflows.attachToModal
export const homeWorkflowsWorkflowDetailsSelector = (state) => state.home.workflows.workflowDetails
export const homeWorkflowsEditTagsModalSelector = (state) => state.home.workflows.editTagsModal
