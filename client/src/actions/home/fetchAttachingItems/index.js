import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/home'
import {
  HOME_FETCH_ATTACHING_ITEMS_SUCCESS,
  HOME_FETCH_ATTACHING_ITEMS_START,
  HOME_FETCH_ATTACHING_ITEMS_FAILURE,
} from '../types'
import {
  showAlertAboveAll,
  showAlertAboveAllSuccess,
  showAlertAboveAllWarning,
} from '../../alertNotifications'


const fetchAttachingItemsStart = () => createAction(HOME_FETCH_ATTACHING_ITEMS_START)

const fetchAttachingItemsSuccess = (items) => createAction(HOME_FETCH_ATTACHING_ITEMS_SUCCESS, items)

const fetchAttachingItemsFailure = () => createAction(HOME_FETCH_ATTACHING_ITEMS_FAILURE)

export default () => (
  async (dispatch) => {
    dispatch(fetchAttachingItemsStart())

    try {
      const { status, payload } = await API.postApiCall('/api/list_notes', {
        editable: true,
        fields: ['title', 'note_type'],  
      })

      if (status === httpStatusCodes.OK) {
        const messages = payload.meta?.messages

        dispatch(fetchAttachingItemsSuccess(payload))

        if (messages) {
          messages.forEach(message => {
            if (message.type === 'success')
              dispatch(showAlertAboveAllSuccess({ message: message.message }))
            else if (message.type === 'warning')
              dispatch(showAlertAboveAllWarning({ message: message.message }))
          })
        }
      } else {
        dispatch(fetchAttachingItemsFailure())
        if (payload?.error) {
          const { message: message_1 } = payload.error
          dispatch(showAlertAboveAll({ message: message_1 }))
        } else {
          dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
        }
      }

      return { status, payload }
    } catch (e) {
      console.error(e)
      dispatch(showAlertAboveAll({ message: 'Something went wrong!' }))
    }
  }
)
