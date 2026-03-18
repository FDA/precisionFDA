import axios from 'axios'
import { NotificationPreferences, NotificationPreferencesPayload } from './types'

type NotificationPreferencesResponse = {
  preference: NotificationPreferences
}

export const fetchNotificationsPreferences = async () => {
  return axios.get<NotificationPreferencesResponse>('/api/v2/notification-preferences').then(r => r.data)
}

export const saveNotificationsPreferences = async (payload: NotificationPreferencesPayload): Promise<void> => {
  await axios.put('/api/v2/notification-preferences', payload)
}
