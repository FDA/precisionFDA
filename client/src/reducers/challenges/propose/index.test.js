import reducer from './index'
import {
  PROPOSE_CHALLENGE_FETCH_FAILURE,
  PROPOSE_CHALLENGE_FETCH_START,
  PROPOSE_CHALLENGE_FETCH_SUCCESS,
} from '../../../actions/challenges/types'


describe('reducer actions processing', () => {
  it('PROPOSE_CHALLENGE_FETCH_START', () => {
    const initialState = {
      isSubmitting: true,    
    }
    const action = { type: PROPOSE_CHALLENGE_FETCH_START }

    expect(reducer(initialState, action)).toEqual({
      isSubmitting: true,
      submissionSuccess: false,
    })
  })

  it('PROPOSE_CHALLENGE_FETCH_SUCCESS', () => {
    const initialState = {
      isSubmitting: true,    
    }
    const action = { type: PROPOSE_CHALLENGE_FETCH_SUCCESS }

    expect(reducer(initialState, action)).toEqual({
      isSubmitting: false,
      submissionSuccess: true,
    })
  })

  it('PROPOSE_CHALLENGE_FAILURE', () => {
    const initialState = {
      isSubmitting: true,    
    }
    const action = { type: PROPOSE_CHALLENGE_FETCH_FAILURE }

    expect(reducer(initialState, action)).toEqual({
      isSubmitting: false,
      submissionSuccess: false,
    })
  })
})
