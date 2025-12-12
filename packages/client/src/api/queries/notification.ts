import { useQuery } from '@tanstack/react-query'
import { fetchUnreadNotifications } from '../../features/notifications/notifications.api'

export const getFetchUnreadNotificationsQueryKey = () => ['notifications', 'unread']

export const useFetchUnreadNotificationsQuery = () =>
  useQuery({
    queryKey: getFetchUnreadNotificationsQueryKey(),
    queryFn: fetchUnreadNotifications,
  })
