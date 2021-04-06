import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/news'
import {
  NEWS_YEAR_LIST_FETCH_START,
  NEWS_YEAR_LIST_FETCH_SUCCESS,
  NEWS_YEAR_LIST_FETCH_FAILURE,
} from '../types'
import { showAlertAboveAll } from '../../alertNotifications'
import { IYearListActionPayload } from '../../interfaces'


const fetchNewsYearListStart = () => createAction(NEWS_YEAR_LIST_FETCH_START)

const fetchNewsYearListSuccess = (payload: IYearListActionPayload) => createAction(NEWS_YEAR_LIST_FETCH_SUCCESS, payload)

const fetchNewsYearListFailure = () => createAction(NEWS_YEAR_LIST_FETCH_FAILURE)

const fetchNewsYearList = () => (
  (dispatch: any, getState: any) => {
    dispatch(fetchNewsYearListStart())

    return API.getNewsYearList()
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          const yearList = response.payload
          const actionPayload: IYearListActionPayload = {
            yearList: yearList
          }
          dispatch(fetchNewsYearListSuccess(actionPayload))
        } else {
          dispatch(fetchNewsYearListFailure())
          dispatch(showAlertAboveAll({ message: 'Something went wrong loading News year list!' }))
        }
      })
      .catch(e => {
        console.error(e)
        dispatch(showAlertAboveAll({ message: 'Something went wrong loading News year list!' }))
      })
  }
)

export {
  fetchNewsYearList
}
