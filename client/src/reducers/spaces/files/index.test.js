import reducer from './index'
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
  FETCH_ACCESSIBLE_SPACES_SUCCESS,
  COPY_OBJECTS_TO_SPACE_START,
  COPY_OBJECTS_TO_SPACE_SUCCESS,
  COPY_OBJECTS_TO_SPACE_FAILURE,
} from '../../../actions/spaces/types'


describe('reducer actions processing', () => {
  it('SPACE_FILES_FETCH_START', () => {
    const initialState = {}
    const action = { type: SPACE_FILES_FETCH_START }

    expect(reducer(initialState, action)).toEqual({
      isFetching: true,
    })
  })

  it('SPACE_FILES_FETCH_SUCCESS', () => {
    const initialState = {}
    const payload = {
      files: ['some files'],
      links: { link: 'link' },
    }
    const action = { type: SPACE_FILES_FETCH_SUCCESS, payload }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
      entries: payload.files,
      links: payload.links,
    })
  })

  it('SPACE_FILES_FETCH_FAILURE', () => {
    const initialState = {}
    const action = { type: SPACE_FILES_FETCH_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
    })
  })

  it('SPACE_FILES_TABLE_SORT', () => {
    const initialState = {}
    const payload = { type: 'name', direction: 'ASC' }
    const action = { type: SPACE_FILES_TABLE_SORT, payload }

    expect(reducer(initialState, action)).toEqual({
      sortType: payload.type,
      sortDirection: payload.direction,
    })
  })

  it('SPACE_FILES_RESET_FILTERS', () => {
    const initialState = {}
    const action = { type: SPACE_FILES_RESET_FILTERS }

    expect(reducer(initialState, action)).toEqual({
      isCheckedAll: false,
      sortType: null,
      sortDirection: null,
    })
  })

  it('SPACE_FILES_SHOW_ADD_FOLDER_MODAL', () => {
    const initialState = {}
    const action = { type: SPACE_FILES_SHOW_ADD_FOLDER_MODAL }

    expect(reducer(initialState, action)).toEqual({
      addFolderModal: { isOpen: true },
    })
  })

  it('SPACE_FILES_HIDE_ADD_FOLDER_MODAL', () => {
    const initialState = {}
    const action = { type: SPACE_FILES_HIDE_ADD_FOLDER_MODAL }

    expect(reducer(initialState, action)).toEqual({
      addFolderModal: { isOpen: false },
    })
  })

  it('SPACE_FILES_TOGGLE_CHECKBOX', () => {
    const initialState = {
      entries: [
        { id: 1, isChecked: true },
        { id: 2, isChecked: false },
      ],
      isCheckedAll: false,
    }
    const action = { type: SPACE_FILES_TOGGLE_CHECKBOX, payload: 2 }

    expect(reducer(initialState, action)).toEqual({
      entries: [
        { id: 1, isChecked: true },
        { id: 2, isChecked: true },
      ],
      isCheckedAll: true,
    })
  })

  it('SPACE_FILES_TOGGLE_ALL_CHECKBOXES', () => {
    const initialState = {
      entries: [
        { id: 1, isChecked: true },
        { id: 2, isChecked: true },
      ],
      isCheckedAll: true,
    }
    const action = { type: SPACE_FILES_TOGGLE_ALL_CHECKBOXES }

    expect(reducer(initialState, action)).toEqual({
      entries: [
        { id: 1, isChecked: false },
        { id: 2, isChecked: false },
      ],
      isCheckedAll: false,
    })
  })

  it('SPACE_FILES_SHOW_ACTION_MODAL', () => {
    const initialState = {}
    const payload = 'action'
    const action = { type: SPACE_FILES_SHOW_ACTION_MODAL, payload }

    expect(reducer(initialState, action)).toEqual({
      actionModal: { isOpen: true, action: payload },
    })
  })

  it('SPACE_FILES_HIDE_ACTION_MODAL', () => {
    const initialState = {}
    const action = { type: SPACE_FILES_HIDE_ACTION_MODAL }

    expect(reducer(initialState, action)).toEqual({
      actionModal: { isOpen: false },
    })
  })

  it('SPACE_FETCH_FILES_BY_ACTION_START', () => {
    const initialState = {}
    const action = { type: SPACE_FETCH_FILES_BY_ACTION_START }

    expect(reducer(initialState, action)).toEqual({
      actionModal: { isLoading: true },
    })
  })

  it('SPACE_FETCH_FILES_BY_ACTION_SUCCESS', () => {
    const initialState = {}
    const payload = {
      action: 'delete',
      files: ['file1', 'file2', 'file3'],
    }
    const action = { type: SPACE_FETCH_FILES_BY_ACTION_SUCCESS, payload }

    expect(reducer(initialState, action)).toEqual({
      actionModal: { isLoading: false, files: payload.files },
    })
  })

  it('SPACE_FETCH_FILES_BY_ACTION_FAILURE', () => {
    const initialState = {}
    const action = { type: SPACE_FETCH_FILES_BY_ACTION_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      actionModal: { isLoading: false },
    })
  })

  it('SPACE_DELETE_FILES_START', () => {
    const initialState = {}
    const action = { type: SPACE_DELETE_FILES_START }

    expect(reducer(initialState, action)).toEqual({
      actionModal: { isLoading: true },
    })
  })

  it('SPACE_DELETE_FILES_SUCCESS', () => {
    const initialState = {}
    const action = { type: SPACE_DELETE_FILES_SUCCESS }

    expect(reducer(initialState, action)).toEqual({
      actionModal: {
        isLoading: false,
        isOpen: false,
        files: [],
      },
    })
  })

  it('SPACE_DELETE_FILES_FAILURE', () => {
    const initialState = {}
    const action = { type: SPACE_DELETE_FILES_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      actionModal: {
        isLoading: false,
        isOpen: true,
      },
    })
  })

  it('SPACE_PUBLISH_FILES_START', () => {
    const initialState = {}
    const action = { type: SPACE_PUBLISH_FILES_START }

    expect(reducer(initialState, action)).toEqual({
      actionModal: { isLoading: true },
    })
  })

  it('SPACE_PUBLISH_FILES_SUCCESS', () => {
    const initialState = {}
    const action = { type: SPACE_PUBLISH_FILES_SUCCESS }

    expect(reducer(initialState, action)).toEqual({
      actionModal: {
        isLoading: false,
        isOpen: false,
        files: [],
      },
    })
  })

  it('SPACE_PUBLISH_FILES_FAILURE', () => {
    const initialState = {}
    const action = { type: SPACE_PUBLISH_FILES_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      actionModal: {
        isLoading: false,
        isOpen: true,
      },
    })
  })

  it('SPACE_FILES_SHOW_RENAME_MODAL', () => {
    const initialState = {}
    const action = { type: SPACE_FILES_SHOW_RENAME_MODAL }

    expect(reducer(initialState, action)).toEqual({
      renameModal: {
        isOpen: true,
      },
    })
  })

  it('SPACE_FILES_HIDE_RENAME_MODAL', () => {
    const initialState = {}
    const action = { type: SPACE_FILES_HIDE_RENAME_MODAL }

    expect(reducer(initialState, action)).toEqual({
      renameModal: {
        isOpen: false,
      },
    })
  })

  it('SPACE_RENAME_FILE_START', () => {
    const initialState = {}
    const action = { type: SPACE_RENAME_FILE_START }

    expect(reducer(initialState, action)).toEqual({
      renameModal: { isLoading: true },
    })
  })

  it('SPACE_RENAME_FILE_SUCCESS', () => {
    const initialState = {}
    const action = { type: SPACE_RENAME_FILE_SUCCESS }

    expect(reducer(initialState, action)).toEqual({
      renameModal: {
        isLoading: false,
        isOpen: false,
      },
    })
  })

  it('SPACE_RENAME_FILE_FAILURE', () => {
    const initialState = {}
    const action = { type: SPACE_RENAME_FILE_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      renameModal: {
        isLoading: false,
        isOpen: true,
      },
    })
  })

  it('SPACE_ADD_FOLDER_START', () => {
    const initialState = {}
    const action = { type: SPACE_ADD_FOLDER_START }

    expect(reducer(initialState, action)).toEqual({
      addFolderModal: { isLoading: true },
    })
  })

  it('SPACE_ADD_FOLDER_SUCCESS', () => {
    const initialState = {}
    const action = { type: SPACE_ADD_FOLDER_SUCCESS }

    expect(reducer(initialState, action)).toEqual({
      addFolderModal: {
        isLoading: false,
        isOpen: false,
      },
    })
  })

  it('SPACE_ADD_FOLDER_FAILURE', () => {
    const initialState = {}
    const action = { type: SPACE_ADD_FOLDER_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      addFolderModal: {
        isLoading: false,
        isOpen: true,
      },
    })
  })

  it('SPACE_FILES_SHOW_COPY_MODAL', () => {
    const initialState = {}
    const action = { type: SPACE_FILES_SHOW_COPY_MODAL }

    expect(reducer(initialState, action)).toEqual({
      copyModal: {
        isOpen: true,
        step: 1,
      },
    })
  })

  it('SPACE_FILES_HIDE_COPY_MODAL', () => {
    const initialState = {}
    const action = { type: SPACE_FILES_HIDE_COPY_MODAL }

    expect(reducer(initialState, action)).toEqual({
      copyModal: {
        isOpen: false,
      },
    })
  })

  it('FETCH_ACCESSIBLE_SPACES_SUCCESS', () => {
    const initialState = {}
    const action = { type: FETCH_ACCESSIBLE_SPACES_SUCCESS }

    expect(reducer(initialState, action)).toEqual({
      copyModal: {
        isLoading: false,
        step: 2,
      },
    })
  })

  it('COPY_OBJECTS_TO_SPACE_START', () => {
    const initialState = {}
    const action = { type: COPY_OBJECTS_TO_SPACE_START }

    expect(reducer(initialState, action)).toEqual({
      copyModal: { isLoading: true },
    })
  })

  it('COPY_OBJECTS_TO_SPACE_SUCCESS', () => {
    const initialState = {}
    const action = { type: COPY_OBJECTS_TO_SPACE_SUCCESS }

    expect(reducer(initialState, action)).toEqual({
      copyModal: {
        isLoading: false,
        isOpen: false,
      },
    })
  })

  it('COPY_OBJECTS_TO_SPACE_FAILURE', () => {
    const initialState = {}
    const action = { type: COPY_OBJECTS_TO_SPACE_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      copyModal: {
        isLoading: false,
        isOpen: true,
      },
    })
  })
})
