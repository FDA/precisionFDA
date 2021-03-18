import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/experts'
import {
  EXPERTS_YEAR_LIST_FETCH_START,
  EXPERTS_YEAR_LIST_FETCH_SUCCESS,
  EXPERTS_YEAR_LIST_FETCH_FAILURE,
} from '../types'
import { showAlertAboveAll } from '../../alertNotifications'
import { IYearListActionPayload } from '../../interfaces'


const fetchExpertsYearListStart = () => createAction(EXPERTS_YEAR_LIST_FETCH_START)

const fetchExpertsYearListSuccess = (payload: IYearListActionPayload) => createAction(EXPERTS_YEAR_LIST_FETCH_SUCCESS, payload)

const fetchExpertsYearListFailure = () => createAction(EXPERTS_YEAR_LIST_FETCH_FAILURE)

const fetchExpertsYearList = () => (
  (dispatch: any) => {
    dispatch(fetchExpertsYearListStart())

    return API.getExpertsYearList()
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          const yearList = response.payload
          const actionPayload: IYearListActionPayload = {
            yearList: yearList
          }
          dispatch(fetchExpertsYearListSuccess(actionPayload))
        } else {
          dispatch(fetchExpertsYearListFailure())
          dispatch(showAlertAboveAll({ message: 'Something went wrong loading Experts year list!' }))
        }
      })
      .catch(e => {
        console.error(e)
        dispatch(showAlertAboveAll({ message: 'Something went wrong loading Experts year list!' }))
      })
  }
)

export {
  fetchExpertsYearList
}
