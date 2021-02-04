import reducer from './index'
import {
  SPACE_JOBS_FETCH_START,
  SPACE_JOBS_FETCH_SUCCESS,
  SPACE_JOBS_FETCH_FAILURE,
  SPACE_JOBS_TABLE_SORT,
  SPACE_JOBS_RESET_FILTERS,
  SPACE_JOBS_SET_CURRENT_PAGE_VALUE,
} from '../../../actions/spaces/types'


describe('reducer actions processing', () => {
  it('SPACE_JOBS_FETCH_START', () => {
    const initialState = {}
    const action = { type: SPACE_JOBS_FETCH_START }

    expect(reducer(initialState, action)).toEqual({
      isFetching: true,
    })
  })

  it('SPACE_JOBS_FETCH_SUCCESS', () => {
    const initialState = {}
    const payload = { jobs: ['job-1', 'job-2']}
    const action = { type: SPACE_JOBS_FETCH_SUCCESS, payload }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
      entries: payload.jobs,
    })
  })

  it('SPACE_JOBS_FETCH_FAILURE', () => {
    const initialState = {}
    const action = { type: SPACE_JOBS_FETCH_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      isFetching: false,
    })
  })

  it('SPACE_JOBS_TABLE_SORT', () => {
    const initialState = {}
    const payload = { type: 'name', direction: 'ASC' }
    const action = { type: SPACE_JOBS_TABLE_SORT, payload }

    expect(reducer(initialState, action)).toEqual({
      sortType: payload.type,
      sortDirection: payload.direction,
    })
  })

  it('SPACE_JOBS_RESET_FILTERS', () => {
    const initialState = {}
    const action = { type: SPACE_JOBS_RESET_FILTERS }

    expect(reducer(initialState, action)).toEqual({
      sortType: null,
      sortDirection: null,
    })
  })

  it('SPACE_JOBS_SET_CURRENT_PAGE_VALUE', () => {
    const initialState = {}
    const action = { type: SPACE_JOBS_SET_CURRENT_PAGE_VALUE, payload: 2 }

    expect(reducer(initialState, action)).toEqual({
      pagination: {
        currentPage: 2,
      },
    })
  })
})
