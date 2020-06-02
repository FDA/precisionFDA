import initialState from './initialState'
import { createReducer } from '../../utils/redux'
import {
  ALERT_SHOW_ABOVE_ALL,
  ALERT_HIDE_MESSAGE,
} from '../../actions/alertNotifications/types'
import { mapToAlertNotification } from '../../views/shapes/AlertShape'


export default createReducer(initialState, {
  [ALERT_SHOW_ABOVE_ALL]: (state, alert) => ({
    ...state,
    messages: [
      ...state.messages,
      mapToAlertNotification(alert),
    ],
  }),
  [ALERT_HIDE_MESSAGE]: (state, id) => ({
    ...state,
    messages: [...state.messages.filter((alert) => alert.id !== id)],
  }),
})
