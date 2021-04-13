import { combineReducers } from 'redux'

import list from './list'
import challenge from './challenge'
import propose from './propose'


export default combineReducers({
  list,
  challenge,
  propose,
})
