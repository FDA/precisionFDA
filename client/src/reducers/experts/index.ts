import { combineReducers } from 'redux'

import list from './list'
import details from './details'


export default combineReducers({
  list,
  details,
})
