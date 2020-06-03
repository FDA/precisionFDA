import httpStatusCodes from 'http-status-codes'

import { createAction, processLockedSpaceForbidden } from '../../../../utils/redux'
import * as API from '../../../../api/members'
import {
  SPACE_MEMBERS_UPDATE_ROLE_START,
  SPACE_MEMBERS_UPDATE_ROLE_SUCCESS,
  SPACE_MEMBERS_UPDATE_ROLE_FAILURE,
} from '../../types'
import { showAlertAboveAllSuccess, showAlertAboveAll } from '../../../alertNotifications'
import { spaceDataSelector } from '../../../../reducers/spaces/space/selectors'
import { fetchMembers, hideMemberRoleChangeModal } from '../index'


const updateRoleStart = () => createAction(SPACE_MEMBERS_UPDATE_ROLE_START)
const updateRoleSuccess = () => createAction(SPACE_MEMBERS_UPDATE_ROLE_SUCCESS)
const updateRoleFailure = (errors = {}) => createAction(SPACE_MEMBERS_UPDATE_ROLE_FAILURE, errors)

export default (spaceId, updateRoleData) => (
  (dispatch, getState) => {
    let params = { role: updateRoleData.toRole }
    const memberId = updateRoleData.memberId

    dispatch(updateRoleStart())

    return API.memberRoleUpdate(spaceId, memberId, params).then(response => {
      const statusIsOk = response.status === httpStatusCodes.OK
      if (statusIsOk) {
        const payload = response.payload

        const successMessage = () => {
          if (payload.role === 'disable') {
             return `The member ${payload.member} was successfully disabled.`
          } else if (payload.role === 'enable') {
            return `The member ${payload.member} was successfully enabled.`
          } else {
            return `The role of member ${payload.member} was updated successfully to '${payload.role}'.`
          }
        }

        dispatch(updateRoleSuccess())
        dispatch(fetchMembers(spaceId))
        dispatch(showAlertAboveAllSuccess({ message: successMessage() }))
      } else if (response.status === httpStatusCodes.FORBIDDEN) {
        dispatch(hideMemberRoleChangeModal())
        processLockedSpaceForbidden(dispatch, spaceDataSelector(getState()))
      } else {
        if (response.payload && response.payload.errors) {
          dispatch(updateRoleFailure(response.payload))
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
      dispatch(updateRoleFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    })
  }
)
