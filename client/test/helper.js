import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'


const BACKEND_URL = 'https://example.com'

const mockStore = configureStore([thunk])

export {
  BACKEND_URL,
  mockStore,
}
