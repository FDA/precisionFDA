import { createAction } from '../../utils/redux'
import { ALERT_SHOW_ABOVE_ALL, ALERT_HIDE_MESSAGE } from './types'
import { ALERT_ABOVE_ALL } from '../../constants'


export const showAlertAboveAll = (alert) => createAction(ALERT_SHOW_ABOVE_ALL, {
  ...alert,
  type: ALERT_ABOVE_ALL,
})

export const showAlertAboveAllSuccess = (alert) => showAlertAboveAll({
  ...alert,
  style: 'success',
})

export const showAlertAboveAllWarning = (alert) => showAlertAboveAll({
  ...alert,
  style: 'warning',
})

export const showAlertAboveAllInfo = (alert) => showAlertAboveAll({
  ...alert,
  style: 'info',
})

export const hideAlert = (id) => createAction(ALERT_HIDE_MESSAGE, id)
