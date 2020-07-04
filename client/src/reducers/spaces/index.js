import { combineReducers } from 'redux'

import list from './list'
import space from './space'
import files from './files'
import apps from './apps'
import jobs from './jobs'
import workflows from './workflows'
import members from './members'
import newSpace from './newSpace'


export default combineReducers({
  list,
  space,
  files,
  apps,
  jobs,
  workflows,
  members,
  newSpace,
})
