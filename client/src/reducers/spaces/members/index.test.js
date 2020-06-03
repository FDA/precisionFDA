import reducer from './index'
import {
  SPACE_MEMBERS_FETCH_START,
  SPACE_MEMBERS_FETCH_SUCCESS,
  SPACE_MEMBERS_FETCH_FAILURE,
  SPACE_MEMBERS_ADD_START,
  SPACE_MEMBERS_ADD_SUCCESS,
  SPACE_MEMBERS_ADD_FAILURE,
  SPACE_MEMBERS_SHOW_ADD_MEMBERS_MODAL,
  SPACE_MEMBERS_HIDE_ADD_MEMBERS_MODAL,
  SPACE_MEMBERS_SHOW_ROLE_CHANGE_MODAL,
  SPACE_MEMBERS_HIDE_ROLE_CHANGE_MODAL,
  SPACE_MEMBERS_UPDATE_ROLE_START,
  SPACE_MEMBERS_UPDATE_ROLE_SUCCESS,
  SPACE_MEMBERS_UPDATE_ROLE_FAILURE,
} from '../../../actions/spaces/types'


describe('reducer actions processing', () => {
  it('SPACE_MEMBERS_FETCH_START', () => {
    const initialState = {}
    const action = { type: SPACE_MEMBERS_FETCH_START }

    expect(reducer(initialState, action)).toEqual({
      isFetching: true,
    })
  })

  it('SPACE_MEMBERS_FETCH_SUCCESS', () => {
    const initialState = {}
    const payload = { members: ['member-1', 'member-2']}
    const action = { type: SPACE_MEMBERS_FETCH_SUCCESS, payload }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
      entries: payload.members,
    })
  })

  it('SPACE_MEMBERS_FETCH_FAILURE', () => {
    const initialState = {}
    const action = { type: SPACE_MEMBERS_FETCH_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
    })
  })

  it('SPACE_MEMBERS_ADD_START', () => {
    const initialState = {}
    const action = { type: SPACE_MEMBERS_ADD_START }

    expect(reducer(initialState, action)).toEqual({
      addMembersModal: {
        isLoading: true,
      },
    })
  })

  it('SPACE_MEMBERS_ADD_SUCCESS', () => {
    const initialState = {}
    const action = { type: SPACE_MEMBERS_ADD_SUCCESS }

    expect(reducer(initialState, action)).toEqual({
      addMembersModal: {
        isLoading: false,
        isOpen: false,
      },
    })
  })

  it('SPACE_MEMBERS_ADD_FAILURE', () => {
    const initialState = {}
    const action = { type: SPACE_MEMBERS_ADD_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      addMembersModal: {
        isOpen: true,
        isLoading: false,
      },
    })
  })

  it('SPACE_MEMBERS_UPDATE_ROLE_START', () => {
    const initialState = {}
    const action = { type: SPACE_MEMBERS_UPDATE_ROLE_START }

    expect(reducer(initialState, action)).toEqual({
      roleChangeModal: {
        isLoading: true,
      },
    })
  })

  it('SPACE_MEMBERS_UPDATE_ROLE_SUCCESS', () => {
    const initialState = {}
    const action = { type: SPACE_MEMBERS_UPDATE_ROLE_SUCCESS }

    expect(reducer(initialState, action)).toEqual({
      roleChangeModal: {
        isLoading: false,
        isOpen: false,
      },
    })
  })

  it('SPACE_MEMBERS_UPDATE_ROLE_FAILURE', () => {
    const initialState = {}
    const action = { type: SPACE_MEMBERS_UPDATE_ROLE_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      roleChangeModal: {
        isOpen: true,
        isLoading: false,
      },
    })
  })

  it('SPACE_MEMBERS_SHOW_ADD_MEMBERS_MODAL', () => {
    const initialState = {}
    const action = { type: SPACE_MEMBERS_SHOW_ADD_MEMBERS_MODAL }

    expect(reducer(initialState, action)).toEqual({
      addMembersModal: {
        isOpen: true,
      },
    })
  })

  it('SPACE_MEMBERS_HIDE_ADD_MEMBERS_MODAL', () => {
    const initialState = {}
    const action = { type: SPACE_MEMBERS_HIDE_ADD_MEMBERS_MODAL }

    expect(reducer(initialState, action)).toEqual({
      addMembersModal: {
        isOpen: false,
      },
    })
  })

  it('SPACE_MEMBERS_SHOW_ROLE_CHANGE_MODAL', () => {
    const initialState = {}
    const payload = { updateRoleData: { toRole: 'viewer', memberId: 15 }}
    const action = { type: SPACE_MEMBERS_SHOW_ROLE_CHANGE_MODAL, payload }

    expect(reducer(initialState, action)).toEqual({
      roleChangeModal: {
        isOpen: true,
        updateRoleData: payload.updateRoleData,
      },
    })
  })

  it('SPACE_MEMBERS_HIDE_ROLE_CHANGE_MODAL', () => {
    const initialState = {}
    const action = { type: SPACE_MEMBERS_HIDE_ROLE_CHANGE_MODAL }

    expect(reducer(initialState, action)).toEqual({
      roleChangeModal: {
        isOpen: false,
      },
    })
  })
})
