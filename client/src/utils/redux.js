import { fetchSpace } from '../actions/spaces/fetchSpace'
import { showAlertAboveAllWarning } from '../actions/alertNotifications'


const createReducer = (initialState, handler = {}) => (state = initialState, action) => (
  handler.hasOwnProperty(action.type) ? handler[action.type](state, action.payload) : state
)

const createAction = (type, payload = {}) => ({ type, payload })

const processLockedSpaceForbidden = (dispatch, space) => {
  dispatch(fetchSpace(space.id))
  dispatch(showAlertAboveAllWarning({ message: 'Actions cannot be performed in a locked space' }))
}

export {
  createAction,
  createReducer,
  processLockedSpaceForbidden,
}
