import reducer from './index'
import {
  SPACE_WORKFLOWS_FETCH_START,
  SPACE_WORKFLOWS_FETCH_SUCCESS,
  SPACE_WORKFLOWS_FETCH_FAILURE,
  SPACE_WORKFLOWS_TABLE_SORT,
  SPACE_WORKFLOWS_RESET_FILTERS,
  SPACE_WORKFLOWS_TOGGLE_CHECKBOX,
  SPACE_WORKFLOWS_TOGGLE_ALL_CHECKBOXES,
  SPACE_WORKFLOWS_SHOW_COPY_MODAL,
  SPACE_WORKFLOWS_HIDE_COPY_MODAL,
  FETCH_ACCESSIBLE_SPACES_START,
  FETCH_ACCESSIBLE_SPACES_SUCCESS,
  FETCH_ACCESSIBLE_SPACES_FAILURE,
  COPY_OBJECTS_TO_SPACE_START,
  COPY_OBJECTS_TO_SPACE_SUCCESS,
  COPY_OBJECTS_TO_SPACE_FAILURE,
  SPACE_WORKFLOWS_SET_CURRENT_PAGE_VALUE,
} from '../../../actions/spaces/types'


describe('reducer actions processing', () => {
  it('SPACE_WORKFLOWS_FETCH_START', () => {
    const initialState = {}
    const action = { type: SPACE_WORKFLOWS_FETCH_START }

    expect(reducer(initialState, action)).toEqual({
      isFetching: true,
    })
  })

  it('SPACE_WORKFLOWS_FETCH_SUCCESS', () => {
    const initialState = {}
    const payload = { workflows: ['workflow-1', 'workflow-2'], links: {}}
    const action = { type: SPACE_WORKFLOWS_FETCH_SUCCESS, payload }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
      entries: payload.workflows,
      links: payload.links,
    })
  })

  it('SPACE_WORKFLOWS_FETCH_FAILURE', () => {
    const initialState = {}
    const action = { type: SPACE_WORKFLOWS_FETCH_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
    })
  })

  it('SPACE_WORKFLOWS_TABLE_SORT', () => {
    const initialState = {}
    const payload = { type: 'name', direction: 'ASC' }
    const action = { type: SPACE_WORKFLOWS_TABLE_SORT, payload }

    expect(reducer(initialState, action)).toEqual({
      sortType: payload.type,
      sortDirection: payload.direction,
    })
  })

  it('SPACE_WORKFLOWS_RESET_FILTERS', () => {
    const initialState = {}
    const action = { type: SPACE_WORKFLOWS_RESET_FILTERS }

    expect(reducer(initialState, action)).toEqual({
      sortType: null,
      sortDirection: null,
    })
  })

  it('SPACE_WORKFLOWS_TOGGLE_CHECKBOX', () => {
    const initialState = {
      entries: [
        { id: 1, isChecked: true },
        { id: 2, isChecked: false },
      ],
      isCheckedAll: false,
    }
    const action = { type: SPACE_WORKFLOWS_TOGGLE_CHECKBOX, payload: 2 }

    expect(reducer(initialState, action)).toEqual({
      entries: [
        { id: 1, isChecked: true },
        { id: 2, isChecked: true },
      ],
      isCheckedAll: true,
    })
  })

  it('SPACE_WORKFLOWS_TOGGLE_ALL_CHECKBOXES', () => {
    const initialState = {
      entries: [
        { id: 1, isChecked: true },
        { id: 2, isChecked: true },
      ],
      isCheckedAll: true,
    }
    const action = { type: SPACE_WORKFLOWS_TOGGLE_ALL_CHECKBOXES }

    expect(reducer(initialState, action)).toEqual({
      entries: [
        { id: 1, isChecked: false },
        { id: 2, isChecked: false },
      ],
      isCheckedAll: false,
    })
  })

  it('SPACE_WORKFLOWS_SHOW_COPY_MODAL', () => {
    const initialState = {}
    const action = { type: SPACE_WORKFLOWS_SHOW_COPY_MODAL }

    expect(reducer(initialState, action)).toEqual({
      copyModal: {
        isOpen: true,
      },
    })
  })

  it('SPACE_WORKFLOWS_HIDE_COPY_MODAL', () => {
    const initialState = {}
    const action = { type: SPACE_WORKFLOWS_HIDE_COPY_MODAL }

    expect(reducer(initialState, action)).toEqual({
      copyModal: {
        isOpen: false,
      },
    })
  })

  it('FETCH_ACCESSIBLE_SPACES_START', () => {
    const initialState = {}
    const action = { type: FETCH_ACCESSIBLE_SPACES_START }

    expect(reducer(initialState, action)).toEqual({
      copyModal: {
        isLoading: true,
      },
    })
  })

  it('FETCH_ACCESSIBLE_SPACES_SUCCESS', () => {
    const initialState = {}
    const action = { type: FETCH_ACCESSIBLE_SPACES_SUCCESS }

    expect(reducer(initialState, action)).toEqual({
      copyModal: {
        isLoading: false,
      },
    })
  })

  it('FETCH_ACCESSIBLE_SPACES_FAILURE', () => {
    const initialState = {}
    const action = { type: FETCH_ACCESSIBLE_SPACES_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      copyModal: {
        isLoading: false,
      },
    })
  })

  it('COPY_OBJECTS_TO_SPACE_START', () => {
    const initialState = {}
    const action = { type: COPY_OBJECTS_TO_SPACE_START }

    expect(reducer(initialState, action)).toEqual({
      copyModal: {
        isLoading: true,
      },
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
      },
    })
  })

  it('SPACE_WORKFLOWS_SET_CURRENT_PAGE_VALUE', () => {
    const initialState = {}
    const action = { type: SPACE_WORKFLOWS_SET_CURRENT_PAGE_VALUE, payload: 3 }

    expect(reducer(initialState, action)).toEqual({
      pagination: {
        currentPage: 3,
      },
    })
  })
})
