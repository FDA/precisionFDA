import reducer from './index'
import initialState from './initialState'
import {
  SPACE_CREATION_START,
  SPACE_CREATION_SUCCESS,
  SPACE_CREATION_FAILURE,
  SPACE_EDITING_START,
  SPACE_EDITING_SUCCESS,
  SPACE_EDITING_FAILURE,
  SPACE_CREATION_FETCH_INFO_START,
  SPACE_CREATION_FETCH_INFO_SUCCESS,
  SPACE_CREATION_FETCH_INFO_FAILURE,
} from '../../../actions/spaces/types'


describe('reducer', () => {
  it('returns initialState', () => {
    expect(reducer(undefined, {})).toEqual(initialState)
  })

  it('processes SPACE_CREATION_START', () => {
    const action = { type: SPACE_CREATION_START }
    const expectState = {
      isSubmitting: true,
      errors: initialState.errors,
    }

    expect(reducer({}, action)).toEqual(expectState)
  })

  it('processes SPACE_CREATION_SUCCESS', () => {
    const action = { type: SPACE_CREATION_SUCCESS }
    const expectState = {
      isSubmitting: false,
      errors: initialState.errors,
    }

    expect(reducer({}, action)).toEqual(expectState)
  })

  it('processes SPACE_CREATION_FAILURE', () => {
    const errors = { someKey: 'some error' }
    const action = { type: SPACE_CREATION_FAILURE, payload: { errors }}
    const expectState = {
      isSubmitting: false,
      errors,
    }

    expect(reducer({}, action)).toEqual(expectState)
  })

  it('processes SPACE_EDITING_START', () => {
    const action = { type: SPACE_EDITING_START }
    const expectState = {
      isSubmitting: true,
      errors: initialState.errors,
    }

    expect(reducer({}, action)).toEqual(expectState)
  })

  it('processes SPACE_EDITING_SUCCESS', () => {
    const action = { type: SPACE_EDITING_SUCCESS }
    const expectState = {
      isSubmitting: false,
      errors: initialState.errors,
    }

    expect(reducer({}, action)).toEqual(expectState)
  })

  it('processes SPACE_EDITING_FAILURE', () => {
    const errors = { someKey: 'some error' }
    const action = { type: SPACE_EDITING_FAILURE, payload: { errors }}
    const expectState = {
      isSubmitting: false,
      errors,
    }

    expect(reducer({}, action)).toEqual(expectState)
  })

  it('processes SPACE_CREATION_FETCH_INFO_START', () => {
    const action = { type: SPACE_CREATION_FETCH_INFO_START }
    const expectState = {
      info: {
        isFetching: true,
      },
    }

    expect(reducer({}, action)).toEqual(expectState)
  })

  it('processes SPACE_CREATION_FETCH_INFO_SUCCESS', () => {
    const info = { someKey: 'value' }
    const action = { type: SPACE_CREATION_FETCH_INFO_SUCCESS, payload: info }
    const expectState = {
      info: {
        ...info,
        isFetching: false,
      },
    }

    expect(reducer({}, action)).toEqual(expectState)
  })

  it('processes SPACE_CREATION_FETCH_INFO_FAILURE', () => {
    const action = { type: SPACE_CREATION_FETCH_INFO_FAILURE }
    const expectState = {
      info: {
        isFetching: false,
      },
    }

    expect(reducer({}, action)).toEqual(expectState)
  })
})
