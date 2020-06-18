import initialState from './initialState'
import { createReducer } from '../../utils/redux'
import {
  ALERT_SHOW_ABOVE_ALL,
  ALERT_HIDE_MESSAGE,
} from '../../actions/alertNotifications/types'
import { ALERT_MESSAGES_MAX_COUNT } from '../../constants'
import { mapToAlertNotification } from '../../views/shapes/AlertShape'


export default createReducer(initialState, {
  [ALERT_SHOW_ABOVE_ALL]: (state, alert) => ({
    ...state,
    messages: [
      ...state.messages.slice(1 - ALERT_MESSAGES_MAX_COUNT),
      mapToAlertNotification(alert),
    ],
  }),

  [ALERT_HIDE_MESSAGE]: (state, id) => ({
    ...state,
    messages: [...state.messages.filter((alert) => alert.id !== id)],
  }),
})
