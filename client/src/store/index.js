import { applyMiddleware, createStore } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunk from 'redux-thunk'

import reducer from '../reducers'
import { spacesMiddleware } from './middleware'


export default createStore(reducer, {}, composeWithDevTools(applyMiddleware(spacesMiddleware, thunk)))
