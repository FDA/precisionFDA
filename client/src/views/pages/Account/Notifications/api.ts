import { backendCall } from "../../../../utils/api"

export const fetchNotificationsPreferences = async () => {
  const res = await backendCall('/api/notification_preferences', 'GET')
  return res?.payload
}

export const saveNotificationsPreferences = async (preference: any) => {
  const res = await backendCall('/api/notification_preferences/change', 'POST', { ...preference })
  return res?.payload
}