import { combineReducers } from 'redux'

import context from './context'
import spaces from './spaces'
import alertNotifications from './alertNotifications'
import home from './home'
import challenges from './challenges'
import news from './news'
import experts from './experts'
import error from '../views/components/ErrorWrapper/reducer'


export default combineReducers({
  context,
  spaces,
  alertNotifications,
  error,
  home,
  challenges,
  news,
  experts,
})
