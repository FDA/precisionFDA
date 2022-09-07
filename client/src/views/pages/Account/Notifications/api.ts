import { backendCall } from '../../../../utils/api'

export const fetchNotificationsPreferences = async () => {
  const res = await backendCall('/api/notification_preferences', 'GET')
  return res?.payload
}

export const saveNotificationsPreferences = async (preference: any) => {
  const input = {
    ...preference.reviewer,
    ...preference.sponsor,
    ...preference.reviewer_lead,
    ...preference.sponsor_lead,
    ...preference.admin,
    ...preference.private,
  }
  Object.entries(input).forEach(([key, value]) => {
    const newValue = value === true ? 1 : 0
    input[key] = newValue
  })
  const res = await backendCall(
    '/api/notification_preferences/change',
    'POST',
    { ...input },
  )
  return res?.payload
}
