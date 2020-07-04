import { createReducer } from '../../../utils/redux'
import initialState from './initialState'
import {
  SPACE_CREATION_START,
  SPACE_CREATION_SUCCESS,
  SPACE_CREATION_FAILURE,
  SPACE_EDITING_START,
  SPACE_EDITING_SUCCESS,
  SPACE_EDITING_FAILURE,
  SPACE_CREATION_FETCH_INFO_SUCCESS,
  SPACE_CREATION_FETCH_INFO_START,
  SPACE_CREATION_FETCH_INFO_FAILURE,
} from '../../../actions/spaces/types'


export default createReducer(initialState, {
  [SPACE_CREATION_START]: state => ({
    ...state,
    isSubmitting: true,
    errors: initialState.errors,
  }),

  [SPACE_CREATION_SUCCESS]: (state) => ({
    ...state,
    isSubmitting: false,
    errors: initialState.errors,
  }),

  [SPACE_CREATION_FAILURE]: (state, { errors }) => ({
    ...state,
    errors,
    isSubmitting: false,
  }),

  [SPACE_EDITING_START]: state => ({
    ...state,
    isSubmitting: true,
    errors: initialState.errors,
  }),

  [SPACE_EDITING_SUCCESS]: (state) => ({
    ...state,
    isSubmitting: false,
    errors: initialState.errors,
  }),

  [SPACE_EDITING_FAILURE]: (state, { errors }) => ({
    ...state,
    errors,
    isSubmitting: false,
  }),

  [SPACE_CREATION_FETCH_INFO_START]: (state) => ({
    ...state,
    info: {
      ...state.info,
      isFetching: true,
    },
  }),

  [SPACE_CREATION_FETCH_INFO_SUCCESS]: (state, payload) => ({
    ...state,
    info: {
      ...state.info,
      ...payload,
      isFetching: false,
    },
  }),

  [SPACE_CREATION_FETCH_INFO_FAILURE]: (state) => ({
    ...state,
    info: {
      ...state.info,
      isFetching: false,
    },
  }),
})
