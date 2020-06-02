import reducer from '../index'
import { alertMessagesSelector } from './selectors'
import { mockStore } from '../../../test/helper'
import {
  showAlertAboveAll,
  hideAlert,
} from '../../actions/alertNotifications'


describe('alertNotifications reducer', () => {
  it('ALERT_SHOW_ABOVE_ALL', () => {
    const message = 'some message'
    const store = mockStore(reducer({}, showAlertAboveAll({ message })))
    expect(alertMessagesSelector(store.getState())[0].message).toBe(message)
  })

  it('ALERT_HIDE_MESSAGE', () => {
    const message = 'some message'
    const initialState = {
      alertNotifications: {
        messages: [{ id: 1, message }, { id: 2, message }],
      },
    }
    const store = mockStore(reducer(initialState, hideAlert(2)))
    expect(alertMessagesSelector(store.getState())[0].id).toBe(1)
  })
})
