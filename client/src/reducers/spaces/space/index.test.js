import reducer from './index'
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


describe('reducer actions processing', () => {
  it('SPACE_FETCH_START', () => {
    const initialState = {}
    const action = { type: SPACE_FETCH_START }

    expect(reducer(initialState, action)).toEqual({
      isFetching: true,
    })
  })

  it('SPACE_FETCH_SUCCESS', () => {
    const initialState = {}
    const payload = 'some space'
    const action = { type: SPACE_FETCH_SUCCESS, payload }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
      data: { ...payload },
    })
  })

  it('SPACE_FETCH_FAILURE', () => {
    const initialState = {}
    const action = { type: SPACE_FETCH_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
    })
  })

  it('SPACE_SIDE_MENU_TOGGLE', () => {
    const initialState = {}
    const action = { type: SPACE_SIDE_MENU_TOGGLE }

    expect(reducer(initialState, action)).toEqual({
      isSideMenuHidden: !initialState.isSideMenuHidden,
    })
  })

  it('SPACE_ACCEPT_START', () => {
    const initialState = {}
    const action = { type: SPACE_ACCEPT_START }
    const expectState = { isAccepting: true }

    expect(reducer(initialState, action)).toEqual(expectState)
  })

  it('SPACE_ACCEPT_SUCCESS', () => {
    const initialState = {}
    const action = { type: SPACE_ACCEPT_SUCCESS }
    const expectState = { isAccepting: false }

    expect(reducer(initialState, action)).toEqual(expectState)
  })

  it('SPACE_ACCEPT_FAILURE', () => {
    const initialState = {}
    const action = { type: SPACE_ACCEPT_FAILURE }
    const expectState = { isAccepting: false }

    expect(reducer(initialState, action)).toEqual(expectState)
  })

  it('SPACE_LAYOUT_HIDE_LOCK_MODAL', () => {
    const initialState = {}
    const action = { type: SPACE_LAYOUT_HIDE_LOCK_MODAL }

    expect(reducer(initialState, action)).toEqual({
      lockSpaceModal: { isOpen: false },
    })
  })

  it('SPACE_LAYOUT_SHOW_LOCK_MODAL', () => {
    const initialState = {}
    const action = { type: SPACE_LAYOUT_SHOW_LOCK_MODAL }

    expect(reducer(initialState, action)).toEqual({
      lockSpaceModal: { isOpen: true },
    })
  })

  it('SPACE_LAYOUT_HIDE_UNLOCK_MODAL', () => {
    const initialState = {}
    const action = { type: SPACE_LAYOUT_HIDE_UNLOCK_MODAL }

    expect(reducer(initialState, action)).toEqual({
      unlockSpaceModal: { isOpen: false },
    })
  })

  it('SPACE_LAYOUT_SHOW_UNLOCK_MODAL', () => {
    const initialState = {}
    const action = { type: SPACE_LAYOUT_SHOW_UNLOCK_MODAL }

    expect(reducer(initialState, action)).toEqual({
      unlockSpaceModal: { isOpen: true },
    })
  })

  it('SPACE_LAYOUT_HIDE_DELETE_MODAL', () => {
    const initialState = {}
    const action = { type: SPACE_LAYOUT_HIDE_DELETE_MODAL }

    expect(reducer(initialState, action)).toEqual({
      deleteSpaceModal: { isOpen: false },
    })
  })

  it('SPACE_LAYOUT_SHOW_DELETE_MODAL', () => {
    const initialState = {}
    const action = { type: SPACE_LAYOUT_SHOW_DELETE_MODAL }

    expect(reducer(initialState, action)).toEqual({
      deleteSpaceModal: { isOpen: true },
    })
  })

  it('LOCK_SPACE_START', () => {
    const initialState = {}
    const action = { type: LOCK_SPACE_START }

    expect(reducer(initialState, action)).toEqual({
      lockSpaceModal: { isLoading: true },
    })
  })

  it('LOCK_SPACE_SUCCESS', () => {
    const initialState = {}
    const payload = 'some space'
    const action = { type: LOCK_SPACE_SUCCESS, payload }

    expect(reducer(initialState, action)).toEqual({
      data: { ...payload },
      lockSpaceModal: {
        isOpen: false,
        isLoading: false,
      },
    })
  })

  it('LOCK_SPACE_FAILURE', () => {
    const initialState = {}
    const action = { type: LOCK_SPACE_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      lockSpaceModal: {
        isOpen: true,
        isLoading: false,
      },
    })
  })

  it('UNLOCK_SPACE_START', () => {
    const initialState = {}
    const action = { type: UNLOCK_SPACE_START }

    expect(reducer(initialState, action)).toEqual({
      unlockSpaceModal: { isLoading: true },
    })
  })

  it('UNLOCK_SPACE_SUCCESS', () => {
    const initialState = {}
    const payload = 'some space'
    const action = { type: UNLOCK_SPACE_SUCCESS, payload }

    expect(reducer(initialState, action)).toEqual({
      data: { ...payload },
      unlockSpaceModal: {
        isOpen: false,
        isLoading: false,
      },
    })
  })

  it('UNLOCK_SPACE_FAILURE', () => {
    const initialState = {}
    const action = { type: UNLOCK_SPACE_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      unlockSpaceModal: {
        isOpen: true,
        isLoading: false,
      },
    })
  })

  it('DELETE_SPACE_START', () => {
    const initialState = {}
    const action = { type: DELETE_SPACE_START }

    expect(reducer(initialState, action)).toEqual({
      deleteSpaceModal: { isLoading: true },
    })
  })

  it('DELETE_SPACE_SUCCESS', () => {
    const initialState = {}
    const action = { type: DELETE_SPACE_SUCCESS }

    expect(reducer(initialState, action)).toEqual({
      deleteSpaceModal: {
        isOpen: false,
        isLoading: false,
      },
    })
  })

  it('DELETE_SPACE_FAILURE', () => {
    const initialState = {}
    const action = { type: DELETE_SPACE_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      deleteSpaceModal: {
        isOpen: true,
        isLoading: false,
      },
    })
  })

  it('SPACE_SHOW_ADD_DATA_MODAL', () => {
    const initialState = {}
    const payload = 'dataType'
    const action = { type: SPACE_SHOW_ADD_DATA_MODAL, payload }

    expect(reducer(initialState, action)).toEqual({
      spaceAddDataModal: { isOpen: true, isCheckedAll: false, dataType: payload },
    })
  })

  it('SPACE_HIDE_ADD_DATA_MODAL', () => {
    const initialState = {}
    const action = { type: SPACE_HIDE_ADD_DATA_MODAL }

    expect(reducer(initialState, action)).toEqual({
      accessibleFiles: [],
      accessibleApps: [],
      accessibleWorkflows: [],
      spaceAddDataModal: {
        isOpen: false,
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
    })
  })

  it('FETCH_ACCESSIBLE_FILES_START', () => {
    const initialState = {}
    const action = { type: FETCH_ACCESSIBLE_FILES_START }

    expect(reducer(initialState, action)).toEqual({
      accessibleFiles: [],
      accessibleFilesLoading: true,
      spaceAddDataModal: { isLoading: true },
    })
  })

  it('FETCH_ACCESSIBLE_FILES_SUCCESS', () => {
    const initialState = {}
    const files = ['file1', 'file2', 'file3']
    const action = { type: FETCH_ACCESSIBLE_FILES_SUCCESS, payload: files }

    expect(reducer(initialState, action)).toEqual({
      accessibleFiles: files,
      accessibleFilesLoading: false,
      spaceAddDataModal: {
        isOpen: true,
        isLoading: false,
      },
    })
  })

  it('FETCH_ACCESSIBLE_FILES_FAILURE', () => {
    const initialState = {}
    const action = { type: FETCH_ACCESSIBLE_FILES_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      accessibleFilesLoading: false,
      spaceAddDataModal: {
        isOpen: true,
        isLoading: false,
      },
    })
  })

  it('FETCH_ACCESSIBLE_APPS_START', () => {
    const initialState = {}
    const action = { type: FETCH_ACCESSIBLE_APPS_START }

    expect(reducer(initialState, action)).toEqual({
      accessibleApps: [],
      accessibleAppsLoading: true,
      spaceAddDataModal: { isLoading: true },
    })
  })

  it('FETCH_ACCESSIBLE_APPS_SUCCESS', () => {
    const initialState = {}
    const apps = ['app1', 'app2']
    const action = { type: FETCH_ACCESSIBLE_APPS_SUCCESS, payload: apps }

    expect(reducer(initialState, action)).toEqual({
      accessibleApps: apps,
      accessibleAppsLoading: false,
      spaceAddDataModal: {
        isOpen: true,
        isLoading: false,
      },
    })
  })

  it('FETCH_ACCESSIBLE_APPS_FAILURE', () => {
    const initialState = {}
    const action = { type: FETCH_ACCESSIBLE_APPS_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      accessibleAppsLoading: false,
      spaceAddDataModal: {
        isOpen: true,
        isLoading: false,
      },
    })
  })

  it('FETCH_ACCESSIBLE_WORKFLOWS_START', () => {
    const initialState = {}
    const action = { type: FETCH_ACCESSIBLE_WORKFLOWS_START }

    expect(reducer(initialState, action)).toEqual({
      accessibleWorkflows: [],
      accessibleWorkflowsLoading: true,
      spaceAddDataModal: { isLoading: true },
    })
  })

  it('FETCH_ACCESSIBLE_WORKFLOWS_SUCCESS', () => {
    const initialState = {}
    const workflows = ['workflow1', 'workflow2']
    const action = { type: FETCH_ACCESSIBLE_WORKFLOWS_SUCCESS, payload: workflows }

    expect(reducer(initialState, action)).toEqual({
      accessibleWorkflows: workflows,
      accessibleWorkflowsLoading: false,
      spaceAddDataModal: {
        isOpen: true,
        isLoading: false,
      },
    })
  })

  it('FETCH_ACCESSIBLE_WORKFLOWS_FAILURE', () => {
    const initialState = {}
    const action = { type: FETCH_ACCESSIBLE_WORKFLOWS_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      accessibleWorkflowsLoading: false,
      spaceAddDataModal: {
        isOpen: true,
        isLoading: false,
      },
    })
  })

  it('SPACE_FILES_ADD_DATA_TOGGLE_CHECKBOX', () => {
    const initialState = {
      accessibleFiles: [
        { id: 1, isChecked: true },
        { id: 2, isChecked: false },
      ],
      spaceAddDataModal: {
        isCheckedAll: false,
      },
    }
    const action = { type: SPACE_FILES_ADD_DATA_TOGGLE_CHECKBOX, payload: 2 }

    expect(reducer(initialState, action)).toEqual({
      accessibleFiles: [
        { id: 1, isChecked: true },
        { id: 2, isChecked: true },
      ],
      spaceAddDataModal: {
        isCheckedAll: true,
      },
    })
  })

  it('SPACE_FILES_ADD_DATA_TOGGLE_ALL_CHECKBOXES', () => {
    const initialState = {
      accessibleFiles: [
        { id: 1, isChecked: true },
        { id: 2, isChecked: true },
      ],
      spaceAddDataModal: {
        isCheckedAll: true,
      },
    }
    const action = { type: SPACE_FILES_ADD_DATA_TOGGLE_ALL_CHECKBOXES }

    expect(reducer(initialState, action)).toEqual({
      accessibleFiles: [
        { id: 1, isChecked: false },
        { id: 2, isChecked: false },
      ],
      spaceAddDataModal: {
        isCheckedAll: false,
      },
    })
  })

  it('SPACE_APPS_ADD_DATA_TOGGLE_CHECKBOX', () => {
    const initialState = {
      accessibleApps: [
        { id: 1, isChecked: true },
        { id: 2, isChecked: false },
      ],
      spaceAddDataModal: {
        isCheckedAll: false,
      },
    }
    const action = { type: SPACE_APPS_ADD_DATA_TOGGLE_CHECKBOX, payload: 2 }

    expect(reducer(initialState, action)).toEqual({
      accessibleApps: [
        { id: 1, isChecked: true },
        { id: 2, isChecked: true },
      ],
      spaceAddDataModal: {
        isCheckedAll: true,
      },
    })
  })

  it('SPACE_APPS_ADD_DATA_TOGGLE_ALL_CHECKBOXES', () => {
    const initialState = {
      accessibleApps: [
        { id: 1, isChecked: true },
        { id: 2, isChecked: true },
      ],
      spaceAddDataModal: {
        isCheckedAll: true,
      },
    }
    const action = { type: SPACE_APPS_ADD_DATA_TOGGLE_ALL_CHECKBOXES }

    expect(reducer(initialState, action)).toEqual({
      accessibleApps: [
        { id: 1, isChecked: false },
        { id: 2, isChecked: false },
      ],
      spaceAddDataModal: {
        isCheckedAll: false,
      },
    })
  })

  it('SPACE_WORKFLOWS_ADD_DATA_TOGGLE_CHECKBOX', () => {
    const initialState = {
      accessibleWorkflows: [
        { id: 1, isChecked: true },
        { id: 2, isChecked: false },
      ],
      spaceAddDataModal: {
        isCheckedAll: false,
      },
    }
    const action = { type: SPACE_WORKFLOWS_ADD_DATA_TOGGLE_CHECKBOX, payload: 2 }

    expect(reducer(initialState, action)).toEqual({
      accessibleWorkflows: [
        { id: 1, isChecked: true },
        { id: 2, isChecked: true },
      ],
      spaceAddDataModal: {
        isCheckedAll: true,
      },
    })
  })

  it('SPACE_WORKFLOWS_ADD_DATA_TOGGLE_ALL_CHECKBOXES', () => {
    const initialState = {
      accessibleWorkflows: [
        { id: 1, isChecked: true },
        { id: 2, isChecked: true },
      ],
      spaceAddDataModal: {
        isCheckedAll: true,
      },
    }
    const action = { type: SPACE_WORKFLOWS_ADD_DATA_TOGGLE_ALL_CHECKBOXES }

    expect(reducer(initialState, action)).toEqual({
      accessibleWorkflows: [
        { id: 1, isChecked: false },
        { id: 2, isChecked: false },
      ],
      spaceAddDataModal: {
        isCheckedAll: false,
      },
    })
  })

  it('ADD_DATA_TO_SPACE_START', () => {
    const initialState = {}
    const action = { type: ADD_DATA_TO_SPACE_START }

    expect(reducer(initialState, action)).toEqual({
      spaceAddDataModal: { isLoading: true },
    })
  })

  it('ADD_DATA_TO_SPACE_SUCCESS', () => {
    const initialState = {}
    const action = { type: ADD_DATA_TO_SPACE_SUCCESS }

    expect(reducer(initialState, action)).toEqual({
      spaceAddDataModal: {
        isOpen: false,
        isLoading: false,
        isCheckedAll: false,
      },
    })
  })

  it('ADD_DATA_TO_SPACE_FAILURE', () => {
    const initialState = {}
    const action = { type: ADD_DATA_TO_SPACE_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      spaceAddDataModal: {
        isOpen: true,
        isLoading: false,
      },
    })
  })


  it('FETCH_ACCESSIBLE_SPACES_START', () => {
    const initialState = {}
    const action = { type: FETCH_ACCESSIBLE_SPACES_START }

    expect(reducer(initialState, action)).toEqual({
      accessibleSpaces: [],
      accessibleSpacesLoading: true,
    })
  })

  it('FETCH_ACCESSIBLE_SPACES_SUCCESS', () => {
    const initialState = {}
    const spaces = ['space1', 'space2']
    const action = { type: FETCH_ACCESSIBLE_SPACES_SUCCESS, payload: spaces }

    expect(reducer(initialState, action)).toEqual({
      accessibleSpaces: spaces,
      accessibleSpacesLoading: false,
    })
  })

  it('FETCH_ACCESSIBLE_SPACES_FAILURE', () => {
    const initialState = {}
    const action = { type: FETCH_ACCESSIBLE_SPACES_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      accessibleSpacesLoading: false,
    })
  })

  it('SPACE_SELECT_ACCESSIBLE_SPACE', () => {
    const initialState = {
      accessibleSpaces: [
        { scope: 'space-1', isSelected: true },
        { scope: 'space-2', isSelected: false },
      ],
    }
    const action = { type: SPACE_SELECT_ACCESSIBLE_SPACE, payload: 'space-2' }

    expect(reducer(initialState, action)).toEqual({
      accessibleSpaces: [
        { scope: 'space-1', isSelected: false },
        { scope: 'space-2', isSelected: true },
      ],
    })
  })
})
