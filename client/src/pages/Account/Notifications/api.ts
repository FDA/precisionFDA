import axios from 'axios'
import { NotificationPreferences, NotificationPreferencesPayload } from './types'

type NotificationPreferencesResponse = {
  preference: NotificationPreferences
}

export const fetchNotificationsPreferences = async () => {
  return axios.get<NotificationPreferencesResponse>('/api/notification_preferences').then(r => r.data)
}

export const saveNotificationsPreferences = async (payload: NotificationPreferencesPayload) => {
  return axios.post(
    '/api/notification_preferences/change',
    payload,
  ).then(r => r.data)
}
