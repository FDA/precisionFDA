import {
  showAlertAboveAll,
  showAlertAboveAllSuccess,
  showAlertAboveAllWarning,
  showAlertAboveAllInfo,
  hideAlert,
} from '.'
import { ALERT_SHOW_ABOVE_ALL, ALERT_HIDE_MESSAGE } from './types'
import { ALERT_ABOVE_ALL } from '../../constants'


describe('alertNotifications actions', () => {
  it('showAlertAboveAll() creates correct action', () => {
    const payload = { message: 'some type' }
    expect(showAlertAboveAll(payload)).toEqual({
      type: ALERT_SHOW_ABOVE_ALL,
      payload: {
        ...payload,
        type: ALERT_ABOVE_ALL,
      },
    })
  })

  it('showAlertAboveAllSuccess() creates correct action', () => {
    const payload = { message: 'some type' }
    expect(showAlertAboveAllSuccess(payload)).toEqual({
      type: ALERT_SHOW_ABOVE_ALL,
      payload: {
        ...payload,
        type: ALERT_ABOVE_ALL,
        style: 'success',
      },
    })
  })

  it('showAlertAboveAllWarning() creates correct action', () => {
    const payload = { message: 'some type' }
    expect(showAlertAboveAllWarning(payload)).toEqual({
      type: ALERT_SHOW_ABOVE_ALL,
      payload: {
        ...payload,
        type: ALERT_ABOVE_ALL,
        style: 'warning',
      },
    })
  })

  it('showAlertAboveAllInfo() creates correct action', () => {
    const payload = { message: 'some type' }
    expect(showAlertAboveAllInfo(payload)).toEqual({
      type: ALERT_SHOW_ABOVE_ALL,
      payload: {
        ...payload,
        type: ALERT_ABOVE_ALL,
        style: 'info',
      },
    })
  })

  it('hideAlert() creates correct action', () => {
    const payload = 123
    expect(hideAlert(123)).toEqual({
      type: ALERT_HIDE_MESSAGE,
      payload,
    })
  })
})
