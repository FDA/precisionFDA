import reducer from './index'
import {
  CHALLENGES_FETCH_FAILURE,
  CHALLENGES_FETCH_START,
  CHALLENGES_FETCH_SUCCESS,
} from '../../../actions/challenges/types'


describe('reducer actions processing', () => {
  it('CHALLENGES_FETCH_START', () => {
    const initialState = {}
    const action = { type: CHALLENGES_FETCH_START }

    expect(reducer(initialState, action)).toEqual({
      isFetching: true,
    })
  })

  it('CHALLENGES_FETCH_SUCCESS', () => {
    const initialState = {}
    const payload = { challenges: [{ 'id': 1, name: 'challenge 1' }], pagination: {}}
    const action = { type: CHALLENGES_FETCH_SUCCESS, payload }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
      items: payload.challenges,
      pagination: payload.pagination,
    })
  })

  it('CHALLENGES_FETCH_FAILURE', () => {
    const initialState = {}
    const action = { type: CHALLENGES_FETCH_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
    })
  })
})
