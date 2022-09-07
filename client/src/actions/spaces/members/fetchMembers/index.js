import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../../utils/redux'
import * as API from '../../../../api/spaces'
import { mapToMember } from '../../../../views/shapes/MemberShape'
import {
  SPACE_MEMBERS_FETCH_START,
  SPACE_MEMBERS_FETCH_SUCCESS,
  SPACE_MEMBERS_FETCH_FAILURE,
} from '../../types'
import { showAlertAboveAll } from '../../../alertNotifications'


const fetchMembersStart = () => createAction(SPACE_MEMBERS_FETCH_START)

const fetchMembersSuccess = (members) =>
  createAction(SPACE_MEMBERS_FETCH_SUCCESS, { members })

const fetchMembersFailure = () => createAction(SPACE_MEMBERS_FETCH_FAILURE)

export default (spaceId, side) => (
  (dispatch) => {
    let params = { side: side }
    dispatch(fetchMembersStart())

    return API.getMembers(spaceId, params)
      .then(response => {
        const statusIsOk = response.status === httpStatusCodes.OK

        if (statusIsOk) {
          const members = response.payload.space_memberships.map(mapToMember)
          dispatch(fetchMembersSuccess(members))
        } else {
          dispatch(fetchMembersFailure())
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }

        return statusIsOk
      })
      .catch(e => {
        console.error(e)
        dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
      })
  }
)
