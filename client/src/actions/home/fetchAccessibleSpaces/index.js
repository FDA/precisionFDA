import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/files'
import {
  HOME_FETCH_ACCESSIBLE_SPACES_SUCCESS,
  HOME_FETCH_ACCESSIBLE_SPACES_START,
  HOME_FETCH_ACCESSIBLE_SPACES_FAILURE,
} from '../types'
import { showAlertAboveAll } from '../../alertNotifications'
import { mapToAccessibleSpace } from '../../../views/shapes/AccessibleObjectsShape'
import { contextLinksSelector } from '../../../reducers/context/selectors'


const fetchAccessibleSpacesStart = () => createAction(HOME_FETCH_ACCESSIBLE_SPACES_START)

const fetchAccessibleSpacesSuccess = (spaces) => createAction(HOME_FETCH_ACCESSIBLE_SPACES_SUCCESS, spaces)

const fetchAccessibleSpacesFailure = () => createAction(HOME_FETCH_ACCESSIBLE_SPACES_FAILURE)

export default () => (
  async (dispatch, getState) => {
    const state = getState()
    const contextLinks = contextLinksSelector(state)
    const link = contextLinks.accessible_spaces

    dispatch(fetchAccessibleSpacesStart())

    try {
      const response = await API.getApiCall(link)
      const statusIsOK = response.status === httpStatusCodes.OK
      if (statusIsOK) {
        const spaces = response.payload.map(mapToAccessibleSpace)
        dispatch(fetchAccessibleSpacesSuccess(spaces))
      } else {
        dispatch(fetchAccessibleSpacesFailure())
        if (response.payload && response.payload.error) {
          const { type, message } = response.payload.error
          dispatch(showAlertAboveAll({ message: `${type}: ${message}` }))
        } else {
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      }
      return statusIsOK
    } catch (e) {
      console.error(e)
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
