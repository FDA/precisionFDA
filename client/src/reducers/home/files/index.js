import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  HOME_FILES_FETCH_START,
  HOME_FILES_FETCH_SUCCESS,
  HOME_FILES_FETCH_FAILURE,
  HOME_FILES_TOGGLE_ALL_CHECKBOXES,
  HOME_FILES_TOGGLE_CHECKBOX,
  HOME_FILES_FETCH_FILE_DETAILS_START,
  HOME_FILES_FETCH_FILE_DETAILS_SUCCESS,
  HOME_FILES_FETCH_FILE_DETAILS_FAILURE,
  HOME_FILES_RESET_MODALS,
  HOME_FILES_SHOW_MODAL,
  HOME_FILES_HIDE_MODAL,
  HOME_RENAME_FILE_START,
  HOME_RENAME_FILE_SUCCESS,
  HOME_RENAME_FILE_FAILURE,
  HOME_ADD_FOLDER_START,
  HOME_ADD_FOLDER_SUCCESS,
  HOME_ADD_FOLDER_FAILURE,
  HOME_COPY_FILE_TO_SPACE_START,
  HOME_COPY_FILE_TO_SPACE_SUCCESS,
  HOME_COPY_FILE_TO_SPACE_FAILURE,
  HOME_MAKE_PUBLIC_FOLDER_START,
  HOME_MAKE_PUBLIC_FOLDER_SUCCESS,
  HOME_MAKE_PUBLIC_FOLDER_FAILURE,
  HOME_FILES_SET_FILTER_VALUE,
  HOME_FILES_RESET_FILTERS,
  HOME_FILES_MAKE_FEATURED_SUCCESS,
  HOME_DELETE_FILE_START,
  HOME_DELETE_FILE_SUCCESS,
  HOME_DELETE_FILE_FAILURE,
  HOME_FILES_ATTACH_TO_START,
  HOME_FILES_ATTACH_TO_SUCCESS,
  HOME_FILES_ATTACH_TO_FAILURE,
  HOME_MOVE_FILE_START,
  HOME_MOVE_FILE_SUCCESS,
  HOME_MOVE_FILE_FAILURE,
  HOME_ATTACH_LICENSE_START,
  HOME_ATTACH_LICENSE_SUCCESS,
  HOME_ATTACH_LICENSE_FAILURE,
  HOME_FETCH_FILES_BY_ACTION_START,
  HOME_FETCH_FILES_BY_ACTION_SUCCESS,
  HOME_FETCH_FILES_BY_ACTION_FAILURE,
  HOME_EDIT_FILE_TAGS_START,
  HOME_EDIT_FILE_TAGS_SUCCESS,
  HOME_EDIT_FILE_TAGS_FAILURE,
  HOME_FILES_FETCH_SUBFOLDERS_SUCCESS,
  HOME_LICENSE_ACTION_START,
  HOME_LICENSE_ACTION_SUCCESS,
  HOME_LICENSE_ACTION_FAILURE,
} from '../../../actions/home/types'
import { isCheckedAllCheckboxes } from '../../../helpers'
import { HOME_FILE_TYPES } from '../../../constants'
import { findFolder } from '../../spaces/files'


export default createReducer(initialState, {
  [HOME_FILES_FETCH_START]: (state, filesType) => ({
    ...state,
    [filesType]: {
      ...state[filesType],
      isFetching: true,
    },
  }),

  [HOME_FILES_FETCH_SUCCESS]: (state, { filesType, files, pagination, path }) => ({
    ...state,
    [filesType]: {
      ...state[filesType],
      isFetching: false,
      isCheckedAll: false,
      files: [...files],
      filters: {
        ...state[filesType].filters,
        ...pagination,
      },
      path,
    },
  }),

  [HOME_FILES_FETCH_FAILURE]: (state, filesType) => ({
    ...state,
    [filesType]: {
      ...state[filesType],
      isFetching: false,
    },
  }),

  [HOME_FILES_TOGGLE_ALL_CHECKBOXES]: (state, filesType) => {
    const isCheckedAll = isCheckedAllCheckboxes(state[filesType].files)
    return {
      ...state,
      [filesType]: {
        ...state[filesType],
        files: state[filesType].files.map((file) => {
          file.isChecked = !isCheckedAll
          return file
        }),
        isCheckedAll: !isCheckedAll,
      },
    }
  },

  [HOME_FILES_TOGGLE_CHECKBOX]: (state, { filesType, id }) => {
    const files = state[filesType].files.map((file) => {
      if (file.id === id) file.isChecked = !file.isChecked
      return file
    })
    const isCheckedAll = isCheckedAllCheckboxes(files)
    return {
      ...state,
      [filesType]: {
        ...state[filesType],
        isCheckedAll,
        files,
      },
    }
  },

  [HOME_FILES_FETCH_FILE_DETAILS_START]: (state) => ({
    ...state,
    fileDetails: {
      ...state.fileDetails,
      isFetching: true,
      file: {},
      meta: {},
    },
  }),

  [HOME_FILES_FETCH_FILE_DETAILS_SUCCESS]: (state, { file, meta, path }) => ({
    ...state,
    fileDetails: {
      ...state.fileDetails,
      isFetching: false,
      file,
      meta,
      path,
    },
  }),

  [HOME_FILES_FETCH_FILE_DETAILS_FAILURE]: (state) => ({
    ...state,
    fileDetails: {
      ...state.fileDetails,
      isFetching: false,
    },
  }),

  [HOME_FILES_RESET_MODALS]: (state) => ({
    ...state,
    renameModal: {
      ...state.renameModal,
      isOpen: false,
      isLoading: false,
    },
    copyToSpaceModal: {
      ...state.copyToSpaceModal,
      isOpen: false,
      isLoading: false,
    },
    makePublicFolderModal: {
      ...state.makePublicFolderModal,
      isOpen: false,
      isLoading: false,
    },
    addFolderModal: {
      ...state.addFolderModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_FILES_SHOW_MODAL]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isOpen: true,
    },
  }),

  [HOME_FILES_HIDE_MODAL]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isOpen: false,
    },
  }),

  [HOME_ADD_FOLDER_START]: (state) => ({
    ...state,
    addFolderModal: {
      ...state.addFolderModal,
      isLoading: true,
    },
  }),

  [HOME_ADD_FOLDER_SUCCESS]: (state) => ({
    ...state,
    addFolderModal: {
      ...state.addFolderModal,
      isLoading: false,
      isOpen: false,
    },
  }),

  [HOME_ADD_FOLDER_FAILURE]: (state) => ({
    ...state,
    addFolderModal: {
      ...state.addFolderModal,
      isLoading: false,
      isOpen: true,
    },
  }),

  [HOME_RENAME_FILE_START]: (state) => ({
    ...state,
    renameModal: {
      ...state.renameModal,
      isLoading: true,
    },
  }),

  [HOME_RENAME_FILE_SUCCESS]: (state) => ({
    ...state,
    renameModal: {
      ...state.renameModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_RENAME_FILE_FAILURE]: (state) => ({
    ...state,
    renameModal: {
      ...state.renameModal,
      isLoading: false,
    },
  }),

  [HOME_COPY_FILE_TO_SPACE_START]: (state) => ({
    ...state,
    copyToSpaceModal: {
      ...state.copyToSpaceModal,
      isLoading: true,
    },
  }),

  [HOME_COPY_FILE_TO_SPACE_SUCCESS]: (state) => ({
    ...state,
    copyToSpaceModal: {
      ...state.copyToSpaceModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_COPY_FILE_TO_SPACE_FAILURE]: (state) => ({
    ...state,
    copyToSpaceModal: {
      ...state.copyToSpaceModal,
      isLoading: false,
    },
  }),

  [HOME_MAKE_PUBLIC_FOLDER_START]: (state) => ({
    ...state,
    makePublicFolderModal: {
      ...state.makePublicFolderModal,
      isLoading: true,
    },
  }),

  [HOME_MAKE_PUBLIC_FOLDER_SUCCESS]: (state) => ({
    ...state,
    makePublicFolderModal: {
      ...state.makePublicFolderModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_MAKE_PUBLIC_FOLDER_FAILURE]: (state) => ({
    ...state,
    makePublicFolderModal: {
      ...state.makePublicFolderModal,
      isLoading: false,
    },
  }),

  [HOME_MOVE_FILE_START]: (state) => ({
    ...state,
    moveModal: {
      ...state.moveModal,
      isLoading: true,
    },
  }),

  [HOME_MOVE_FILE_SUCCESS]: (state) => ({
    ...state,
    moveModal: {
      ...state.moveModal,
      isOpen: false,
      isLoading: false,
    },
    isFetchFiles: true,
  }),

  [HOME_MOVE_FILE_FAILURE]: (state) => ({
    ...state,
    moveModal: {
      ...state.moveModal,
      isLoading: false,
    },
  }),

  [HOME_FILES_SET_FILTER_VALUE]: (state, { filesType, value }) => ({
    ...state,
    [filesType]: {
      ...state[filesType],
      filters: {
        ...state[filesType].filters,
        ...value,
      },
    },
  }),

  [HOME_FILES_RESET_FILTERS]: (state, { filesType }) => ({
    ...state,
    [filesType]: {
      ...state[filesType],
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
    },
  }),

  [HOME_FILES_ATTACH_TO_START]: (state) => ({
    ...state,
    filesAttachToModal: {
      ...state.filesAttachToModal,
      isLoading: true,
    },
  }),

  [HOME_FILES_ATTACH_TO_SUCCESS]: (state) => ({
    ...state,
    filesAttachToModal: {
      ...state.filesAttachToModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_FILES_ATTACH_TO_FAILURE]: (state) => ({
    ...state,
    filesAttachToModal: {
      ...state.filesAttachToModal,
      isLoading: false,
    },
  }),

  [HOME_DELETE_FILE_START]: (state) => ({
    ...state,
    deleteModal: {
      ...state.deleteModal,
      isLoading: true,
    },
  }),

  [HOME_DELETE_FILE_SUCCESS]: (state) => ({
    ...state,
    deleteModal: {
      ...state.deleteModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_DELETE_FILE_FAILURE]: (state) => ({
    ...state,
    deleteModal: {
      ...state.deleteModal,
      isLoading: false,
    },
  }),

  [HOME_ATTACH_LICENSE_START]: (state) => ({
    ...state,
    attachLicenseModal: {
      ...state.attachLicenseModal,
      isLoading: true,
    },
  }),

  [HOME_ATTACH_LICENSE_SUCCESS]: (state) => ({
    ...state,
    attachLicenseModal: {
      ...state.attachLicenseModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_ATTACH_LICENSE_FAILURE]: (state) => ({
    ...state,
    attachLicenseModal: {
      ...state.attachLicenseModal,
      isLoading: false,
    },
  }),

  [HOME_FILES_MAKE_FEATURED_SUCCESS]: (state, items) => {
    const files = state[HOME_FILE_TYPES.EVERYBODY].files.map((file) => {
      const elem = items.find(e => e.id === file.id)
      if (elem) file = elem
      return file
    })

    const isCheckedAll = isCheckedAllCheckboxes(files)

    return {
      ...state,
      [HOME_FILE_TYPES.EVERYBODY]: {
        ...state[HOME_FILE_TYPES.EVERYBODY],
        items,
        isCheckedAll,
        isFetching: false,
      },
    }
  },

  [HOME_FETCH_FILES_BY_ACTION_START]: (state) => ({
      ...state,
      actionModal: {
        ...state.actionModal,
        isLoading: true,
      },
  }),

  [HOME_FETCH_FILES_BY_ACTION_SUCCESS]: (state, { files }) => ({
      ...state,
      actionModal: {
        ...state.actionModal,
        isLoading: false,
        files,
      },
    }),


  [HOME_FETCH_FILES_BY_ACTION_FAILURE]: (state) => ({
    ...state,
    actionModal: {
      ...state.actionModal,
      isLoading: false,
    },
  }),

  [HOME_EDIT_FILE_TAGS_START]: (state) => ({
    ...state,
    editTagsModal: {
      ...state.editTagsModal,
      isLoading: true,
    },
  }),

  [HOME_EDIT_FILE_TAGS_SUCCESS]: (state) => ({
    ...state,
    editTagsModal: {
      ...state.editTagsModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_EDIT_FILE_TAGS_FAILURE]: (state) => ({
    ...state,
    editTagsModal: {
      ...state.editTagsModal,
      isLoading: false,
    },
  }),

  [HOME_FILES_FETCH_SUBFOLDERS_SUCCESS]: (state, { folderId, nodes }) => {
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

  [HOME_LICENSE_ACTION_START]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isLoading: true,
    },
  }),

  [HOME_LICENSE_ACTION_SUCCESS]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isOpen: false,
      isLoading: false,
    },
  }),

  [HOME_LICENSE_ACTION_FAILURE]: (state, modal) => ({
    ...state,
    [modal]: {
      ...state[modal],
      isLoading: false,
    },
  }),
})
