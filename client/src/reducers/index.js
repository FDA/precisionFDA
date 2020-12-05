import { combineReducers } from 'redux'

import context from './context'
import spaces from './spaces'
import alertNotifications from './alertNotifications'
import home from './home'
import error from '../views/components/ErrorWrapper/reducer'


export default combineReducers({
  context,
  spaces,
  alertNotifications,
  error,
  home,
})
