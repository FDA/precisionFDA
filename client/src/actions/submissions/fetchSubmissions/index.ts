import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/submissions'
import {
  SUBMISSIONS_FETCH_ACTIONS,
  MY_ENTRIES_FETCH_ACTIONS,
} from '../types'
import { mapToSubmission } from '../../../views/shapes/SubmissionShape'
import { showAlertAboveAll } from '../../alertNotifications'
import { ISubmission } from '../../../types/submission'


const fetchSubmissionsStart = (fetchActions: any) => createAction(fetchActions.start)

const fetchSubmissionsSuccess = (fetchActions: any, submissions: ISubmission[]) => createAction(fetchActions.success, submissions)

const fetchSubmissionsFailure = (fetchActions: any) => createAction(fetchActions.failure)

const fetchSubmissionsBase = (challengeId: number, apiFunc: (params: any) => Promise<any>, fetchActions: { start: string, success: string, failure: string }) => ((dispatch: any) => {
  dispatch(fetchSubmissionsStart(fetchActions))

  return apiFunc({ 'challenge_id': challengeId })
    .then(response => {
      if (response.status === httpStatusCodes.OK) {
        const submissions = response.payload.submissions.map(mapToSubmission)
        dispatch(fetchSubmissionsSuccess(fetchActions, submissions))
      } else {
        dispatch(fetchSubmissionsFailure(fetchActions))
        dispatch(showAlertAboveAll({ message: 'Something went wrong loading submissions!' }))
      }
    })
    .catch(e => {
      console.error(e)
      dispatch(showAlertAboveAll({ message: 'Something went wrong loading submissions!' }))
    })
  }
)

const fetchSubmissions = (challengeId: number) => { 
  return fetchSubmissionsBase(challengeId, API.getSubmissions, SUBMISSIONS_FETCH_ACTIONS)
}

const fetchMyEntries = (challengeId: number) => {
  return fetchSubmissionsBase(challengeId, API.getMyEntries, MY_ENTRIES_FETCH_ACTIONS)
}

export {
  fetchSubmissions,
  fetchMyEntries,
}
