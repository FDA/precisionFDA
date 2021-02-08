import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  SPACE_FILES_FETCH_START,
  SPACE_FILES_FETCH_SUCCESS,
  SPACE_FILES_FETCH_FAILURE,
  SPACE_FILES_TABLE_SORT,
  SPACE_FILES_RESET_FILTERS,
  SPACE_FILES_SHOW_ADD_FOLDER_MODAL,
  SPACE_FILES_HIDE_ADD_FOLDER_MODAL,
  SPACE_FILES_TOGGLE_CHECKBOX,
  SPACE_FILES_TOGGLE_ALL_CHECKBOXES,
  SPACE_FILES_SHOW_ACTION_MODAL,
  SPACE_FILES_HIDE_ACTION_MODAL,
  SPACE_FETCH_FILES_BY_ACTION_START,
  SPACE_FETCH_FILES_BY_ACTION_SUCCESS,
  SPACE_FETCH_FILES_BY_ACTION_FAILURE,
  SPACE_DELETE_FILES_START,
  SPACE_DELETE_FILES_SUCCESS,
  SPACE_DELETE_FILES_FAILURE,
  SPACE_PUBLISH_FILES_START,
  SPACE_PUBLISH_FILES_SUCCESS,
  SPACE_PUBLISH_FILES_FAILURE,
  SPACE_FILES_SHOW_RENAME_MODAL,
  SPACE_FILES_HIDE_RENAME_MODAL,
  SPACE_RENAME_FILE_START,
  SPACE_RENAME_FILE_SUCCESS,
  SPACE_RENAME_FILE_FAILURE,
  SPACE_ADD_FOLDER_START,
  SPACE_ADD_FOLDER_SUCCESS,
  SPACE_ADD_FOLDER_FAILURE,
  SPACE_FILES_SHOW_COPY_MODAL,
  SPACE_FILES_HIDE_COPY_MODAL,
  COPY_OBJECTS_TO_SPACE_START,
  COPY_OBJECTS_TO_SPACE_SUCCESS,
  COPY_OBJECTS_TO_SPACE_FAILURE,
  COPY_FILES_TO_PRIVATE_START,
  COPY_FILES_TO_PRIVATE_SUCCESS,
  COPY_FILES_TO_PRIVATE_FAILURE,
  FETCH_ACCESSIBLE_SPACES_START,
  FETCH_ACCESSIBLE_SPACES_SUCCESS,
  FETCH_ACCESSIBLE_SPACES_FAILURE,
  SPACE_FILES_SET_CURRENT_PAGE_VALUE,
} from '../../../actions/spaces/types'
import { isCheckedAllCheckboxes, getModalKey } from '../../../helpers'
import {
  fetchSubfoldersSuccess,
  hideMoveModal,
  showMoveModal,
} from '../../../views/components/Space/Files/MoveModal/actions'


export const findFolder = (folders, id) => {
  if (!folders) return

  let found

  for (let i = 0; i < folders.length; i++) {
    if (folders[i].key === id) {
      found = folders[i]
      break
    } else if (folders[i].children) {
      found = findFolder(folders[i].children, id)

      if (found) return found
    }
  }

  return found
}

export default createReducer(initialState, {
  [SPACE_FILES_FETCH_START]: state => ({
    ...state,
    isFetching: true,
  }),

  [SPACE_FILES_FETCH_SUCCESS]: (state, { files, links, path, pagination }) => ({
    ...state,
    entries: [...files],
    isFetching: false,
    links,
    path,
    pagination,
  }),

  [SPACE_FILES_FETCH_FAILURE]: state => ({
    ...state,
    isFetching: false,
  }),

  [SPACE_FILES_TABLE_SORT]: (state, { type, direction }) => ({
    ...state,
    sortType: type,
    sortDirection: direction,
  }),

  [SPACE_FILES_SET_CURRENT_PAGE_VALUE]: (state, value) => ({
    ...state,
    pagination: {
      ...state.pagination,
      currentPage: value,
    },
  }),

  [SPACE_FILES_RESET_FILTERS]: (state) => ({
    ...state,
    sortType: null,
    sortDirection: null,
    isCheckedAll: false,
  }),

  [SPACE_FILES_SHOW_ADD_FOLDER_MODAL]: (state) => ({
    ...state,
    addFolderModal: {
      ...state.addFolderModal,
      isOpen: true,
    },
  }),

  [SPACE_FILES_HIDE_ADD_FOLDER_MODAL]: (state) => ({
    ...state,
    addFolderModal: {
      ...state.addFolderModal,
      isOpen: false,
    },
  }),

  [SPACE_FILES_TOGGLE_CHECKBOX]: (state, id) => {
    const entries = state.entries.map((file) => {
      if (file.id === id) file.isChecked = !file.isChecked
      return file
    })
    const isCheckedAll = isCheckedAllCheckboxes(entries)
    return {
      ...state,
      isCheckedAll,
      entries,
    }
  },

  [SPACE_FILES_TOGGLE_ALL_CHECKBOXES]: (state) => {
    const isCheckedAll = isCheckedAllCheckboxes(state.entries)
    return {
      ...state,
      entries: state.entries.map((file) => {
        file.isChecked = !isCheckedAll
        return file
      }),
      isCheckedAll: !isCheckedAll,
    }
  },

  [SPACE_FILES_SHOW_ACTION_MODAL]: (state, action) => ({
    ...state,
    actionModal: {
      ...state.actionModal,
      isOpen: true,
      action,
    },
  }),

  [SPACE_FILES_HIDE_ACTION_MODAL]: (state) => ({
    ...state,
    actionModal: {
      ...state.actionModal,
      isOpen: false,
    },
  }),

  [SPACE_FETCH_FILES_BY_ACTION_START]: (state, action) => {
    const modalKey = getModalKey(action)
    return {
      ...state,
      [modalKey]: {
        ...state[modalKey],
        isLoading: true,
      },
    }
  },

  [SPACE_FETCH_FILES_BY_ACTION_SUCCESS]: (state, { action, files }) => {
    const modalKey = getModalKey(action)
    return {
      ...state,
      [modalKey]: {
        ...state[modalKey],
        isLoading: false,
        files,
      },
    }
  },

  [SPACE_FETCH_FILES_BY_ACTION_FAILURE]: (state) => ({
    ...state,
    actionModal: {
      ...state.actionModal,
      isLoading: false,
    },
  }),

  [SPACE_DELETE_FILES_START]: (state) => ({
    ...state,
    actionModal: {
      ...state.actionModal,
      isLoading: true,
    },
  }),

  [SPACE_DELETE_FILES_SUCCESS]: (state) => ({
    ...state,
    actionModal: {
      ...state.actionModal,
      isLoading: false,
      isOpen: false,
      files: [],
    },
  }),

  [SPACE_DELETE_FILES_FAILURE]: (state) => ({
    ...state,
    actionModal: {
      ...state.actionModal,
      isLoading: false,
      isOpen: true,
    },
  }),

  [SPACE_PUBLISH_FILES_START]: (state) => ({
    ...state,
    actionModal: {
      ...state.actionModal,
      isLoading: true,
    },
  }),

  [SPACE_PUBLISH_FILES_SUCCESS]: (state) => ({
    ...state,
    actionModal: {
      ...state.actionModal,
      isLoading: false,
      isOpen: false,
      files: [],
    },
  }),

  [SPACE_PUBLISH_FILES_FAILURE]: (state) => ({
    ...state,
    actionModal: {
      ...state.actionModal,
      isLoading: false,
      isOpen: true,
    },
  }),

  [SPACE_FILES_SHOW_RENAME_MODAL]: (state) => ({
    ...state,
    renameModal: {
      ...state.renameModal,
      isOpen: true,
    },
  }),

  [SPACE_FILES_HIDE_RENAME_MODAL]: (state) => ({
    ...state,
    renameModal: {
      ...state.renameModal,
      isOpen: false,
    },
  }),

  [SPACE_RENAME_FILE_START]: (state) => ({
    ...state,
    renameModal: {
      ...state.renameModal,
      isLoading: true,
    },
  }),

  [SPACE_RENAME_FILE_SUCCESS]: (state) => ({
    ...state,
    renameModal: {
      ...state.renameModal,
      isLoading: false,
      isOpen: false,
    },
  }),

  [SPACE_RENAME_FILE_FAILURE]: (state) => ({
    ...state,
    renameModal: {
      ...state.renameModal,
      isLoading: false,
      isOpen: true,
    },
  }),

  [SPACE_ADD_FOLDER_START]: (state) => ({
    ...state,
    addFolderModal: {
      ...state.addFolderModal,
      isLoading: true,
    },
  }),

  [SPACE_ADD_FOLDER_SUCCESS]: (state) => ({
    ...state,
    addFolderModal: {
      ...state.addFolderModal,
      isLoading: false,
      isOpen: false,
    },
  }),

  [SPACE_ADD_FOLDER_FAILURE]: (state) => ({
    ...state,
    addFolderModal: {
      ...state.addFolderModal,
      isLoading: false,
      isOpen: true,
    },
  }),

  [SPACE_FILES_SHOW_COPY_MODAL]: (state) => ({
    ...state,
    copyModal: {
      ...state.copyModal,
      isOpen: true,
      step: 1,
    },
  }),

  [SPACE_FILES_HIDE_COPY_MODAL]: (state) => ({
    ...state,
    copyModal: {
      ...state.copyModal,
      isOpen: false,
    },
  }),

  [COPY_OBJECTS_TO_SPACE_START]: (state) => ({
    ...state,
    copyModal: {
      ...state.copyModal,
      isLoading: true,
    },
  }),

  [COPY_OBJECTS_TO_SPACE_SUCCESS]: (state) => ({
    ...state,
    copyModal: {
      ...state.copyModal,
      isLoading: false,
      isOpen: false,
    },
  }),

  [COPY_OBJECTS_TO_SPACE_FAILURE]: (state) => ({
    ...state,
    copyModal: {
      ...state.copyModal,
      isLoading: false,
      isOpen: true,
    },
  }),

  [COPY_FILES_TO_PRIVATE_START]: (state) => ({
    ...state,
    actionModal: {
      ...state.actionModal,
      isLoading: true,
    },
  }),

  [COPY_FILES_TO_PRIVATE_SUCCESS]: (state) => ({
    ...state,
    actionModal: {
      ...state.actionModal,
      isLoading: false,
      isOpen: false,
      files: [],
    },
  }),

  [COPY_FILES_TO_PRIVATE_FAILURE]: (state) => ({
    ...state,
    actionModal: {
      ...state.actionModal,
      isLoading: false,
      isOpen: true,
    },
  }),

  [FETCH_ACCESSIBLE_SPACES_START]: (state) => ({
    ...state,
    copyModal: {
      ...state.copyModal,
      isLoading: true,
    },
  }),

  [FETCH_ACCESSIBLE_SPACES_SUCCESS]: (state) => ({
    ...state,
    copyModal: {
      ...state.copyModal,
      isLoading: false,
      step: 2,
    },
  }),

  [FETCH_ACCESSIBLE_SPACES_FAILURE]: (state) => ({
    ...state,
    copyModal: {
      ...state.copyModal,
      isLoading: false,
    },
  }),

  [showMoveModal.type]: (state) => ({
    ...state,
    moveModal: {
      ...state.moveModal,
      isOpen: true,
    },
  }),

  [hideMoveModal.type]: (state) => ({
    ...state,
    moveModal: {
      ...state.moveModal,
      isOpen: false,
      nodes: [...initialState.moveModal.nodes],
    },
  }),

  [fetchSubfoldersSuccess.type]: (state, { folderId, nodes }) => {
    const folder = findFolder(state.moveModal.nodes, folderId) || state.moveModal.nodes[0]

    folder.children = nodes.map(node => ({ key: node.id, title: node.name }))

    return {
      ...state,
      moveModal: {
        ...state.moveModal,
        nodes: [...state.moveModal.nodes],
      },
    }
  },
})
