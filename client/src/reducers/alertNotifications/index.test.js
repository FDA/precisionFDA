import reducer from '../index'
import { alertMessagesSelector } from './selectors'
import { mockStore } from '../../../test/helper'
import {
  showAlertAboveAll,
  hideAlert,
} from '../../actions/alertNotifications'
import { ALERT_MESSAGES_MAX_COUNT } from '../../constants'


describe('alertNotifications reducer', () => {
  it('ALERT_SHOW_ABOVE_ALL', () => {
    const message = 'some message'
    const store = mockStore(reducer({}, showAlertAboveAll({ message })))
    expect(alertMessagesSelector(store.getState())[0].message).toBe(message)
  })

  it('Keeps only certain number of messages on the screen', () => {
    const message = 'some message'
    const initialState = {
      alertNotifications: {
        messages: [{ id: 1, message }, { id: 2, message }, { id: 3, message }],
      },
    }

    const store = mockStore(reducer(initialState, showAlertAboveAll({ message })))
    expect(alertMessagesSelector(store.getState())).toHaveLength(ALERT_MESSAGES_MAX_COUNT)
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
