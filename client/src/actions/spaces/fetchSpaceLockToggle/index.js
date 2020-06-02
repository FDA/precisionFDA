import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/spaces'
import {
  SPACE_LOCK_TOGGLE_START,
  SPACE_LOCK_TOGGLE_SUCCESS,
  SPACE_LOCK_TOGGLE_FAILURE,
} from '../types'
import {
  spacesListSelector,
} from '../../../reducers/spaces/list/selectors'
import { showAlertAboveAllSuccess, showAlertAboveAll } from '../../alertNotifications'
import { mapToSpace } from '../../../views/shapes/SpaceShape'


const fetchSpaceLockToggleStart = (newSpaces) => createAction(SPACE_LOCK_TOGGLE_START, newSpaces)

const fetchSpaceLockToggleSuccess = (changedSpaces) => createAction(SPACE_LOCK_TOGGLE_SUCCESS, changedSpaces)

const fetchSpaceLockToggleFailure = (payload) => createAction(SPACE_LOCK_TOGGLE_FAILURE, payload)

const fetchSpaceLockToggle = (spaceId, lockToggleUrl) => (
  (dispatch, getState) => {
    const spaces = spacesListSelector(getState())
    const newSpaces = spaces.map((space) => {
      if (space.id !== spaceId) return space
      return {
        ...space,
        shared: {
          ...space.shared,
          isLocked: !space.shared.isLocked,
        },
      }
    })

    dispatch(fetchSpaceLockToggleStart(newSpaces))
    return API.toggleLockSpace(lockToggleUrl).then(response => {
      if (response.status === httpStatusCodes.OK) {
        const changedSpace = mapToSpace(response.payload.space)
        const changedSpaces = newSpaces.map((space) => {
          if (space.id !== spaceId) return space
          return { ...space, shared: { ...changedSpace }}
        })
        dispatch(fetchSpaceLockToggleSuccess(changedSpaces))
        dispatch(showAlertAboveAllSuccess({ message: 'Space state changed successfully.' }))
      } else {
        dispatch(fetchSpaceLockToggleFailure({ spaces }))
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      }

    }).catch(e => {
      console.info('fetchSpaceLockToggle', e)
      dispatch(fetchSpaceLockToggleFailure({ spaces }))
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    })
  }
)

export {
  fetchSpaceLockToggle,
}
