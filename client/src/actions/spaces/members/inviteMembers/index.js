import httpStatusCodes from 'http-status-codes'

import { createAction, processLockedSpaceForbidden } from '../../../../utils/redux'
import * as API from '../../../../api/members'
import {
  SPACE_MEMBERS_ADD_START,
  SPACE_MEMBERS_ADD_SUCCESS,
  SPACE_MEMBERS_ADD_FAILURE,
} from '../../types'
import { showAlertAboveAllSuccess, showAlertAboveAll } from '../../../alertNotifications'
import { hideAddMembersModal } from '../index'
import { spaceDataSelector } from '../../../../reducers/spaces/space/selectors'


const inviteMembersStart = () => createAction(SPACE_MEMBERS_ADD_START)
const inviteMembersSuccess = () => createAction(SPACE_MEMBERS_ADD_SUCCESS)
const inviteMembersFailure = (errors = {}) => createAction(SPACE_MEMBERS_ADD_FAILURE, errors)

export default (spaceId, fieldsValues, side) => (
  (dispatch, getState) => {
    let params = { invitees: fieldsValues.invitees, invitees_role: fieldsValues.inviteesRole, side: side }

    dispatch(inviteMembersStart())

    return API.inviteNewMembers(spaceId, params).then(response => {
      const statusIsOk = response.status === httpStatusCodes.OK
      if (statusIsOk) {
        dispatch(inviteMembersSuccess())
        dispatch(showAlertAboveAllSuccess({
          message: `Space members were invited successfully. ${response.payload.message}`,
        }))
      } else if (response.status === httpStatusCodes.FORBIDDEN) {
        dispatch(hideAddMembersModal())
        processLockedSpaceForbidden(dispatch, spaceDataSelector(getState()))
      } else {
        if (response.payload && response.payload.errors) {
          dispatch(inviteMembersFailure(response.payload))
        const { errors } = response.payload
          dispatch(showAlertAboveAll({ message: errors }))
        } else {
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      }
      return statusIsOk
    }).catch(e => {
      console.error(e)
      console.info('inviteMembers', e)
      dispatch(inviteMembersFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    })
  }
)
