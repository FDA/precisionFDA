import reducer from './index'
import {
  CHALLENGE_FETCH_START,
  CHALLENGE_FETCH_SUCCESS,
  CHALLENGE_FETCH_FAILURE,
} from '../../../actions/challenges/types'
import {
  SUBMISSIONS_FETCH_START,
  SUBMISSIONS_FETCH_SUCCESS,
  SUBMISSIONS_FETCH_FAILURE,
  MY_ENTRIES_FETCH_START,
  MY_ENTRIES_FETCH_SUCCESS,
  MY_ENTRIES_FETCH_FAILURE,
} from '../../../actions/submissions/types'


describe('reducer actions processing', () => {
  it('CHALLENGE_FETCH_START', () => {
    const initialState = {}
    const action = { type: CHALLENGE_FETCH_START }

    expect(reducer(initialState, action)).toEqual({
      isFetching: true,
    })
  })

  it('CHALLENGE_FETCH_SUCCESS', () => {
    const initialState = {}
    const payload = { 'id': 1, name: 'challenge 1' }
    const action = { type: CHALLENGE_FETCH_SUCCESS, payload }

    expect(reducer(initialState, action)).toEqual({
      data: payload,
      isFetching: false,
    })
  })

  it('CHALLENGE_FETCH_FAILURE', () => {
    const initialState = {}
    const action = { type: CHALLENGE_FETCH_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
    })
  })

  it('SUBMISSIONS_FETCH_START', () => {
    const initialState = {}
    const action = { type: SUBMISSIONS_FETCH_START }

    expect(reducer(initialState, action)).toEqual({
      submissions: {
        isFetching: true,
      },
    })
  })

  it('SUBMISSIONS_FETCH_SUCCESS', () => {
    const initialState = {}
    const payload = [{ 'id': 1, name: 'submission 1' }]
    const action = { type: SUBMISSIONS_FETCH_SUCCESS, payload }

    expect(reducer(initialState, action)).toEqual({
      submissions: {
        isFetching: false,
        data: payload,
      },
    })
  })

  it('SUBMISSIONS_FETCH_FAILURE', () => {
    const initialState = {}
    const action = { type: SUBMISSIONS_FETCH_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      submissions: {
        isFetching: false,
      },
    })
  })

  it('MY_ENTRIES_FETCH_START', () => {
    const initialState = {}
    const action = { type: MY_ENTRIES_FETCH_START }

    expect(reducer(initialState, action)).toEqual({
      myEntries: {
        isFetching: true,
      },
    })
  })

  it('MY_ENTRIES_FETCH_SUCCESS', () => {
    const initialState = {}
    const payload = [{ 'id': 1, name: 'submission 1' }]
    const action = { type: MY_ENTRIES_FETCH_SUCCESS, payload }

    expect(reducer(initialState, action)).toEqual({
      myEntries: {
        isFetching: false,
        data: payload,
      },
    })
  })

  it('MY_ENTRIES_FETCH_FAILURE', () => {
    const initialState = {}
    const action = { type: MY_ENTRIES_FETCH_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      myEntries: {
        isFetching: false,
      },
    })
  })
})
