import { combineReducers } from 'redux'

import list from './list'
import yearList from './yearList'
import challenge from './challenge'
import propose from './propose'


export default combineReducers({
  list,
  yearList,
  challenge,
  propose,
})
