import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  SPACE_MEMBERS_FETCH_START,
  SPACE_MEMBERS_FETCH_SUCCESS,
  SPACE_MEMBERS_FETCH_FAILURE,
  SPACE_MEMBERS_SHOW_ADD_MEMBERS_MODAL,
  SPACE_MEMBERS_HIDE_ADD_MEMBERS_MODAL,
  SPACE_MEMBERS_SHOW_ROLE_CHANGE_MODAL,
  SPACE_MEMBERS_HIDE_ROLE_CHANGE_MODAL,
  SPACE_MEMBERS_ADD_START,
  SPACE_MEMBERS_ADD_SUCCESS,
  SPACE_MEMBERS_ADD_FAILURE,
  SPACE_MEMBERS_UPDATE_ROLE_START,
  SPACE_MEMBERS_UPDATE_ROLE_SUCCESS,
  SPACE_MEMBERS_UPDATE_ROLE_FAILURE,
} from '../../../actions/spaces/types'


export default createReducer(initialState, {
  [SPACE_MEMBERS_FETCH_START]: state => ({
    ...state,
    isFetching: true,
  }),

  [SPACE_MEMBERS_FETCH_SUCCESS]: (state, { members }) => ({
    ...state,
    entries: [...members],
    isFetching: false,
  }),

  [SPACE_MEMBERS_FETCH_FAILURE]: state => ({
    ...state,
    isFetching: false,
  }),

  [SPACE_MEMBERS_SHOW_ADD_MEMBERS_MODAL]: (state) => ({
    ...state,
    addMembersModal: {
      ...state.addMembersModal,
      isOpen: true,
    },
  }),

  [SPACE_MEMBERS_HIDE_ADD_MEMBERS_MODAL]: (state) => ({
    ...state,
    addMembersModal: {
      ...state.addMembersModal,
      isOpen: false,
    },
  }),

  [SPACE_MEMBERS_SHOW_ROLE_CHANGE_MODAL]: (state, payload) => ({
    ...state,
    roleChangeModal: {
      ...state.roleChangeModal,
      isOpen: true,
      updateRoleData: payload.updateRoleData,
    },
  }),

  [SPACE_MEMBERS_HIDE_ROLE_CHANGE_MODAL]: (state) => ({
    ...state,
    roleChangeModal: {
      ...state.roleChangeModal,
      isOpen: false,
    },
  }),

  [SPACE_MEMBERS_UPDATE_ROLE_START]: state => ({
    ...state,
    roleChangeModal: {
      ...state.roleChangeModal,
      isLoading: true,
    },
  }),

  [SPACE_MEMBERS_UPDATE_ROLE_SUCCESS]: (state) => ({
    ...state,
    roleChangeModal: {
      ...state.roleChangeModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [SPACE_MEMBERS_UPDATE_ROLE_FAILURE]: (state) => ({
    ...state,
    roleChangeModal: {
      ...state.roleChangeModal,
      isOpen: true,
      isLoading: false,
    },
  }),



  [SPACE_MEMBERS_ADD_START]: state => ({
    ...state,
    addMembersModal: {
      ...state.addMembersModal,
      isLoading: true,
    },
  }),

  [SPACE_MEMBERS_ADD_SUCCESS]: (state) => ({
    ...state,
    addMembersModal: {
      ...state.addMembersModal,
      isOpen: false,
      isLoading: false,
    },
  }),

  [SPACE_MEMBERS_ADD_FAILURE]: (state) => ({
    ...state,
    addMembersModal: {
      ...state.addMembersModal,
      isOpen: true,
      isLoading: false,
    },
  }),
})
