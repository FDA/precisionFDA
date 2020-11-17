import reducer from './index'
import {
  HOME_APPS_FETCH_START,
} from '../../../actions/home/types'


describe('reducer apps actions processing', () => {
  it('HOME_APPS_FETCH_START', () => {
    const initialState = {}
    const action = { type: HOME_APPS_FETCH_START }

    expect(reducer(initialState, action)).toEqual({
      privateApps: {
        isFetching: true,
      },
    })
  })
})