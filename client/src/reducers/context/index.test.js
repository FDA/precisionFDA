import reducer from './'
import initialState from './initialState'
import {
  CONTEXT_FETCH_START,
  CONTEXT_FETCH_SUCCESS,
  CONTEXT_FETCH_FAILURE,
} from '../../actions/context/types'


describe('reducer', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState)
  })

  it('processes CONTEXT_FETCH_START', () => {
    const action = { type: CONTEXT_FETCH_START }
    const expectedState = {
      isFetching: true,
      isInitialized: false,
    }

    expect(reducer({}, action)).toEqual(expectedState)
  })

  it('processes CONTEXT_FETCH_SUCCESS', () => {
    const payload = { meta: { links: { new_space: 'some link' }}}
    const action = { type: CONTEXT_FETCH_SUCCESS, payload }
    const expectedState = {
      ...initialState,
      links: {
        new_space: 'some link',
      },
      isFetching: false,
      isInitialized: true,
    }

    expect(reducer(initialState, action)).toEqual(expectedState)
  })

  it('processes CONTEXT_FETCH_FAILURE', () => {
    const action = { type: CONTEXT_FETCH_FAILURE }
    const expectedState = {
      isFetching: false,
      isInitialized: false,
    }

    expect(reducer({}, action)).toEqual(expectedState)
  })
})
