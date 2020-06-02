import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/members'
import {
  SPACE_MEMBERS_CHECK_ROLE_CHANGE_START,
  SPACE_MEMBERS_CHECK_ROLE_CHANGE_SUCCESS,
  SPACE_MEMBERS_CHECK_ROLE_CHANGE_FAILURE,
} from '../../types'
import { showAlertAboveAll } from '../../../alertNotifications'


const checkMemberRoleChangeStart = () => createAction(SPACE_MEMBERS_CHECK_ROLE_CHANGE_START)
const checkMemberRoleChangeSuccess = (roleChangeChecks) => createAction(SPACE_MEMBERS_CHECK_ROLE_CHANGE_SUCCESS, { roleChangeChecks } )
const checkMemberRoleChangeFailure = (errors = {}) => createAction(SPACE_MEMBERS_CHECK_ROLE_CHANGE_FAILURE, errors)

export default (spaceId) => (

  (dispatch) => {

    dispatch(checkMemberRoleChangeStart())

    return API.canChangeRole(spaceId).then(response => {
      const statusIsOk = response.status === httpStatusCodes.OK
      if (statusIsOk) {
        const roleChangeChecks = response.payload

        dispatch(checkMemberRoleChangeSuccess(roleChangeChecks))
      } else {
        if (response.payload && response.payload.errors) {

          dispatch(checkMemberRoleChangeFailure(response.payload))
          const { errors } = response.payload
          dispatch(showAlertAboveAll({ message: errors }))
        } else {
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      }
      return response.payload
    }).catch(e => {
      console.error(e)
      console.info('inviteMembers', e)
      dispatch(checkMemberRoleChangeFailure())
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    })
  }
)
