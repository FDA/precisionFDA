import { Action, applyMiddleware, createStore } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunk, { ThunkDispatch } from 'redux-thunk'
import reducer from '../reducers'
import { spacesMiddleware } from './middleware'

const store = createStore(reducer, {}, composeWithDevTools(applyMiddleware(spacesMiddleware, thunk)))
export default store

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk = ThunkDispatch<RootState, undefined, Action>;
