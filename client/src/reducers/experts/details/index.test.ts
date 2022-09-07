import reducer from './index'
import {
  EXPERTS_SHOW_MODAL,
  EXPERTS_HIDE_MODAL,
} from '../../../actions/experts/types'

describe('modals', () => {
  it('EXPERTS_SHOW_MODAL', () => {
    const initialState = {}
    const action = { type: EXPERTS_SHOW_MODAL, payload: 'modal1' }

    expect(reducer(initialState, action)).toEqual({
      modal1: {
        isOpen: true,
      },
    })
  })

  it('EXPERTS_HIDE_MODAL', () => {
    const initialState = {}
    const action = { type: EXPERTS_HIDE_MODAL, payload: 'modal1' }

    expect(reducer(initialState, action)).toEqual({
      modal1: {
        isOpen: false,
      },
    })
  })
})
