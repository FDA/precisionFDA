import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../utils/redux'
import {
  CONTEXT_FETCH_START,
  CONTEXT_FETCH_SUCCESS,
  CONTEXT_FETCH_FAILURE,
} from './types'
import * as API from '../../api/context'


const contextFetchStart = () => createAction(CONTEXT_FETCH_START)

const contextFetchSuccess = ({ user, meta }) => createAction(CONTEXT_FETCH_SUCCESS, { user, meta })

const contextFetchFailure = () => createAction(CONTEXT_FETCH_FAILURE)

export default () => (
  (dispatch) => {
    dispatch(contextFetchStart())

    return API.fetchContext()
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          dispatch(contextFetchSuccess(response.payload))
        } else {
          dispatch(contextFetchFailure())
        }
      })
      .catch(e => console.error(e))
  }
)
