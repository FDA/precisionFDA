import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  SPACE_FETCH_START,
  SPACE_FETCH_SUCCESS,
  SPACE_FETCH_FAILURE,
  SPACE_SIDE_MENU_TOGGLE,
  SPACE_ACCEPT_START,
  SPACE_ACCEPT_SUCCESS,
  SPACE_ACCEPT_FAILURE,
  SPACE_LAYOUT_HIDE_LOCK_MODAL,
  SPACE_LAYOUT_SHOW_LOCK_MODAL,
  SPACE_LAYOUT_HIDE_UNLOCK_MODAL,
  SPACE_LAYOUT_SHOW_UNLOCK_MODAL,
  SPACE_LAYOUT_HIDE_DELETE_MODAL,
  SPACE_LAYOUT_SHOW_DELETE_MODAL,
  LOCK_SPACE_START,
  LOCK_SPACE_SUCCESS,
  LOCK_SPACE_FAILURE,
  UNLOCK_SPACE_START,
  UNLOCK_SPACE_SUCCESS,
  UNLOCK_SPACE_FAILURE,
  DELETE_SPACE_START,
  DELETE_SPACE_SUCCESS,
  DELETE_SPACE_FAILURE,
  SPACE_SHOW_ADD_DATA_MODAL,
  SPACE_HIDE_ADD_DATA_MODAL,
  FETCH_ACCESSIBLE_FILES_START,
  FETCH_ACCESSIBLE_FILES_SUCCESS,
  FETCH_ACCESSIBLE_FILES_FAILURE,
  FETCH_ACCESSIBLE_APPS_START,
  FETCH_ACCESSIBLE_APPS_SUCCESS,
  FETCH_ACCESSIBLE_APPS_FAILURE,
  FETCH_ACCESSIBLE_WORKFLOWS_START,
  FETCH_ACCESSIBLE_WORKFLOWS_SUCCESS,
  FETCH_ACCESSIBLE_WORKFLOWS_FAILURE,
  SPACE_FILES_ADD_DATA_TOGGLE_CHECKBOX,
  SPACE_FILES_ADD_DATA_TOGGLE_ALL_CHECKBOXES,
  SPACE_APPS_ADD_DATA_TOGGLE_CHECKBOX,
  SPACE_APPS_ADD_DATA_TOGGLE_ALL_CHECKBOXES,
  SPACE_WORKFLOWS_ADD_DATA_TOGGLE_CHECKBOX,
  SPACE_WORKFLOWS_ADD_DATA_TOGGLE_ALL_CHECKBOXES,
  ADD_DATA_TO_SPACE_START,
  ADD_DATA_TO_SPACE_SUCCESS,
  ADD_DATA_TO_SPACE_FAILURE,
  FETCH_ACCESSIBLE_SPACES_START,
  FETCH_ACCESSIBLE_SPACES_SUCCESS,
  FETCH_ACCESSIBLE_SPACES_FAILURE,
  SPACE_SELECT_ACCESSIBLE_SPACE,
} from '../../../actions/spaces/types'
import { isCheckedAllCheckboxes } from '../../../helpers'
import {
  fetchNodesSuccess,
} from '../../../views/components/Space/AddDataModal/actions'
import { findFolder } from '../files'
import { FILES_TYPE_FILE, FILES_TYPE_FOLDER } from '../../../constants'


export default createReducer(initialState, {
  [SPACE_FETCH_START]: state => ({
    ...state,
    isFetching: true,
  }),

  [SPACE_FETCH_SUCCESS]: (state, space) => ({
    ...state,
    data: { ...space },
    isFetching: false,
  }),

  [SPACE_FETCH_FAILURE]: state => ({
    ...state,
    isFetching: false,
  }),

  [SPACE_SIDE_MENU_TOGGLE]: state => ({
    ...state,
    isSideMenuHidden: !state.isSideMenuHidden,
  }),

  [SPACE_ACCEPT_START]: state => ({
    ...state,
    isAccepting: true,
  }),

  [SPACE_ACCEPT_SUCCESS]: state => ({
    ...state,
    isAccepting: false,
  }),

  [SPACE_ACCEPT_FAILURE]: state => ({
    ...state,
    isAccepting: false,
  }),

  [SPACE_LAYOUT_HIDE_LOCK_MODAL]: state => ({
    ...state,
    lockSpaceModal: {
      ...state.lockSpaceModal,
      isOpen: false,
    },
  }),

  [SPACE_LAYOUT_SHOW_LOCK_MODAL]: state => ({
    ...state,
    lockSpaceModal: {
      ...state.lockSpaceModal,
      isOpen: true,
    },
  }),

  [LOCK_SPACE_START]: state => ({
    ...state,
    lockSpaceModal: {
      ...state.lockSpaceModal,
      isLoading: true,
    },
  }),

  [LOCK_SPACE_SUCCESS]: (state, space) => ({
    ...state,
    data: { ...space },
    lockSpaceModal: {
      ...state.lockSpaceModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [LOCK_SPACE_FAILURE]: state => ({
    ...state,
    lockSpaceModal: {
      ...state.lockSpaceModal,
      isOpen: true,
      isLoading: false,
    },
  }),

  [SPACE_LAYOUT_HIDE_UNLOCK_MODAL]: state => ({
    ...state,
    unlockSpaceModal: {
      ...state.unlockSpaceModal,
      isOpen: false,
    },
  }),

  [SPACE_LAYOUT_SHOW_UNLOCK_MODAL]: state => ({
    ...state,
    unlockSpaceModal: {
      ...state.unlockSpaceModal,
      isOpen: true,
    },
  }),

  [UNLOCK_SPACE_START]: state => ({
    ...state,
    unlockSpaceModal: {
      ...state.unlockSpaceModal,
      isLoading: true,
    },
  }),

  [UNLOCK_SPACE_SUCCESS]: (state, space) => ({
    ...state,
    data: { ...space },
    unlockSpaceModal: {
      ...state.unlockSpaceModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [UNLOCK_SPACE_FAILURE]: state => ({
    ...state,
    unlockSpaceModal: {
      ...state.unlockSpaceModal,
      isOpen: true,
      isLoading: false,
    },
  }),

  [SPACE_LAYOUT_HIDE_DELETE_MODAL]: state => ({
    ...state,
    deleteSpaceModal: {
      ...state.deleteSpaceModal,
      isOpen: false,
    },
  }),

  [SPACE_LAYOUT_SHOW_DELETE_MODAL]: state => ({
    ...state,
    deleteSpaceModal: {
      ...state.deleteSpaceModal,
      isOpen: true,
    },
  }),

  [DELETE_SPACE_START]: state => ({
    ...state,
    deleteSpaceModal: {
      ...state.deleteSpaceModal,
      isLoading: true,
    },
  }),

  [DELETE_SPACE_SUCCESS]: state => ({
    ...state,
    deleteSpaceModal: {
      ...state.deleteSpaceModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [DELETE_SPACE_FAILURE]: state => ({
    ...state,
    deleteSpaceModal: {
      ...state.deleteSpaceModal,
      isOpen: true,
      isLoading: false,
    },
  }),

  [SPACE_SHOW_ADD_DATA_MODAL]: (state, dataType) => ({
    ...state,
    spaceAddDataModal: {
      ...state.spaceAddDataModal,
      isOpen: true,
      isCheckedAll: false,
      dataType,
    },
  }),

  [SPACE_HIDE_ADD_DATA_MODAL]: state => ({
    ...state,
    accessibleFiles: [],
    accessibleApps: [],
    accessibleWorkflows: [],
    spaceAddDataModal: {
      ...state.spaceAddDataModal,
      isOpen: false,
      isCheckedAll: false,
    },
    fileTree: {
      ...state.fileTree,
      nodes: [...initialState.fileTree.nodes],
    },
  }),

  [FETCH_ACCESSIBLE_FILES_START]: state => ({
    ...state,
    accessibleFiles: [],
    accessibleFilesLoading: true,
    spaceAddDataModal: {
      ...state.spaceAddDataModal,
      isLoading: true,
    },
  }),

  [FETCH_ACCESSIBLE_FILES_SUCCESS]: (state, files) => ({
    ...state,
    accessibleFiles: files,
    accessibleFilesLoading: false,
    spaceAddDataModal: {
      ...state.spaceAddDataModal,
      isOpen: true,
      isLoading: false,
    },
  }),

  [FETCH_ACCESSIBLE_FILES_FAILURE]: state => ({
    ...state,
    accessibleFilesLoading: false,
    spaceAddDataModal: {
      ...state.spaceAddDataModal,
      isOpen: true,
      isLoading: false,
    },
  }),

  [FETCH_ACCESSIBLE_APPS_START]: state => ({
    ...state,
    accessibleApps: [],
    accessibleAppsLoading: true,
    spaceAddDataModal: {
      ...state.spaceAddDataModal,
      isLoading: true,
    },
  }),

  [FETCH_ACCESSIBLE_APPS_SUCCESS]: (state, apps) => ({
    ...state,
    accessibleApps: apps,
    accessibleAppsLoading: false,
    spaceAddDataModal: {
      ...state.spaceAddDataModal,
      isOpen: true,
      isLoading: false,
    },
  }),

  [FETCH_ACCESSIBLE_APPS_FAILURE]: state => ({
    ...state,
    accessibleAppsLoading: false,
    spaceAddDataModal: {
      ...state.spaceAddDataModal,
      isOpen: true,
      isLoading: false,
    },
  }),

  [FETCH_ACCESSIBLE_WORKFLOWS_START]: state => ({
    ...state,
    accessibleWorkflows: [],
    accessibleWorkflowsLoading: true,
    spaceAddDataModal: {
      ...state.spaceAddDataModal,
      isLoading: true,
    },
  }),

  [FETCH_ACCESSIBLE_WORKFLOWS_SUCCESS]: (state, workflows) => ({
    ...state,
    accessibleWorkflows: workflows,
    accessibleWorkflowsLoading: false,
    spaceAddDataModal: {
      ...state.spaceAddDataModal,
      isOpen: true,
      isLoading: false,
    },
  }),

  [FETCH_ACCESSIBLE_WORKFLOWS_FAILURE]: state => ({
    ...state,
    accessibleWorkflowsLoading: false,
    spaceAddDataModal: {
      ...state.spaceAddDataModal,
      isOpen: true,
      isLoading: false,
    },
  }),

  [SPACE_FILES_ADD_DATA_TOGGLE_CHECKBOX]: (state, id) => {
    const files = state.accessibleFiles.map((file) => {
      if (file.id === id) file.isChecked = !file.isChecked
      return file
    })
    const isCheckedAll = isCheckedAllCheckboxes(files)
    return {
      ...state,
      accessibleFiles: files,
      spaceAddDataModal: {
        ...state.spaceAddDataModal,
        isCheckedAll,
      },
    }
  },

  [SPACE_FILES_ADD_DATA_TOGGLE_ALL_CHECKBOXES]: (state) => {
    const isCheckedAll = isCheckedAllCheckboxes(state.accessibleFiles)
    return {
      ...state,
      accessibleFiles: state.accessibleFiles.map((file) => {
        file.isChecked = !isCheckedAll
        return file
      }),
      spaceAddDataModal: {
        ...state.spaceAddDataModal,
        isCheckedAll: !isCheckedAll,
      },
    }
  },

  [SPACE_APPS_ADD_DATA_TOGGLE_CHECKBOX]: (state, id) => {
    const apps = state.accessibleApps.map((app) => {
      if (app.id === id) app.isChecked = !app.isChecked
      return app
    })
    const isCheckedAll = isCheckedAllCheckboxes(apps)
    return {
      ...state,
      accessibleApps: apps,
      spaceAddDataModal: {
        ...state.spaceAddDataModal,
        isCheckedAll,
      },
    }
  },

  [SPACE_APPS_ADD_DATA_TOGGLE_ALL_CHECKBOXES]: (state) => {
    const isCheckedAll = isCheckedAllCheckboxes(state.accessibleApps)
    return {
      ...state,
      accessibleApps: state.accessibleApps.map((app) => {
        app.isChecked = !isCheckedAll
        return app
      }),
      spaceAddDataModal: {
        ...state.spaceAddDataModal,
        isCheckedAll: !isCheckedAll,
      },
    }
  },

  [SPACE_WORKFLOWS_ADD_DATA_TOGGLE_CHECKBOX]: (state, id) => {
    const workflows = state.accessibleWorkflows.map((workflow) => {
      if (workflow.id === id) workflow.isChecked = !workflow.isChecked
      return workflow
    })
    const isCheckedAll = isCheckedAllCheckboxes(workflows)
    return {
      ...state,
      accessibleWorkflows: workflows,
      spaceAddDataModal: {
        ...state.spaceAddDataModal,
        isCheckedAll,
      },
    }
  },

  [SPACE_WORKFLOWS_ADD_DATA_TOGGLE_ALL_CHECKBOXES]: (state) => {
    const isCheckedAll = isCheckedAllCheckboxes(state.accessibleWorkflows)
    return {
      ...state,
      accessibleWorkflows: state.accessibleWorkflows.map((workflow) => {
        workflow.isChecked = !isCheckedAll
        return workflow
      }),
      spaceAddDataModal: {
        ...state.spaceAddDataModal,
        isCheckedAll: !isCheckedAll,
      },
    }
  },

  [ADD_DATA_TO_SPACE_START]: state => ({
    ...state,
    spaceAddDataModal: {
      ...state.spaceAddDataModal,
      isLoading: true,
    },
  }),

  [ADD_DATA_TO_SPACE_SUCCESS]: (state) => ({
    ...state,
    spaceAddDataModal: {
      ...state.spaceAddDataModal,
      isOpen: false,
      isLoading: false,
      isCheckedAll: false,
    },
  }),

  [ADD_DATA_TO_SPACE_FAILURE]: state => ({
    ...state,
    spaceAddDataModal: {
      ...state.spaceAddDataModal,
      isOpen: true,
      isLoading: false,
    },
  }),

  [FETCH_ACCESSIBLE_SPACES_START]: (state) => ({
    ...state,
    accessibleSpaces: [],
    accessibleSpacesLoading: true,
  }),

  [FETCH_ACCESSIBLE_SPACES_SUCCESS]: (state, spaces) => ({
    ...state,
    accessibleSpaces: spaces,
    accessibleSpacesLoading: false,
  }),

  [FETCH_ACCESSIBLE_SPACES_FAILURE]: (state) => ({
    ...state,
    accessibleSpacesLoading: false,
  }),

  [SPACE_SELECT_ACCESSIBLE_SPACE]: (state, scope) => {
    const spaces = state.accessibleSpaces.map((space) => {
      if (space.scope === scope) {
        space.isSelected = !space.isSelected
      } else {
        space.isSelected = false
      }
      return space
    })
    return {
      ...state,
      accessibleSpaces: spaces,
    }
  },

  [fetchNodesSuccess.type]: (state, { folderId, nodes }) => {
    const tree = [...state.fileTree.nodes]
    const folder = findFolder(tree, folderId) || tree[0]

    folder.children = nodes.map(node => ({
      key: node.type === FILES_TYPE_FOLDER ? node.id : node.uid,
      title: node.name,
      isLeaf: node.type !== FILES_TYPE_FOLDER,
      checkable: node.type === FILES_TYPE_FILE,
    }))

    return {
      ...state,
      fileTree: {
        ...state.fileTree,
        nodes: tree,
      },
    }
  },
})
