import { combineReducers } from 'redux'

import apps from './apps'
import databases from './databases'
import files from './files'
import page from './page'
import workflows from './workflows'
import executions from './executions'
import assets from './assets'


export default combineReducers({
  apps,
  databases,
  files,
  page,
  workflows,
  executions,
  assets,
})
