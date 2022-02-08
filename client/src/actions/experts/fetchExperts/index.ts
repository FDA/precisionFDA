import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/experts'
import {
  EXPERTS_LIST_FETCH_START,
  EXPERTS_LIST_FETCH_SUCCESS,
  EXPERTS_LIST_FETCH_FAILURE,
} from '../types'
import { mapToExpertNodeApi } from '../../../types/expert'
import { mapToPagination } from '../../../views/shapes/PaginationShape'
import { showAlertAboveAll } from '../../alertNotifications'
import { expertsListPaginationSelector, expertsListYearSelector } from '../../../reducers/experts/list/selectors'
import { IExpertsListActionPayload } from '../../../reducers/experts/list/IExpertsListActionPayload'


const fetchExpertsStart = () => createAction(EXPERTS_LIST_FETCH_START)

const fetchExpertsSuccess = (actionPayload: IExpertsListActionPayload) => createAction(EXPERTS_LIST_FETCH_SUCCESS, actionPayload)

const fetchExpertsFailure = () => createAction(EXPERTS_LIST_FETCH_FAILURE)

const fetchExperts = () => (
  (dispatch: any, getState: any) => {
    const state = getState()
    const pagination = expertsListPaginationSelector(state)
    let params = {}

    const year = expertsListYearSelector(state)
    if (year) {
      params = { ...params, year: year }
    }

    if (pagination && pagination.currentPage > 1) {
      params = { ...params, page: pagination.currentPage }
    }

    dispatch(fetchExpertsStart())

    return API.getExperts(params)
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          const actionPayload = {
            items: response.payload.experts.map(mapToExpertNodeApi),
            pagination: mapToPagination(response.payload.meta),
          }
          dispatch(fetchExpertsSuccess(actionPayload))
        } else {
          dispatch(fetchExpertsFailure())
          dispatch(showAlertAboveAll({ message: 'Something went wrong loading Experts!' }))
        }
      })
      .catch(e => {
        console.error(e)
        dispatch(showAlertAboveAll({ message: 'Something went wrong loading Experts!' }))
      })
  }
)

export {
  fetchExperts
}
