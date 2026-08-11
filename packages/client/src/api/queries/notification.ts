import { useQuery } from '@tanstack/react-query'
import { fetchAndMarkDelivered } from '../../features/notifications/notifications.api'

export const fetchAndDeliverUnreadQueryKey = () => ['notifications', 'unread']

export const useFetchAndDeliverUnreadNotificationsQuery = (enabled: boolean) =>
  useQuery({
    queryKey: fetchAndDeliverUnreadQueryKey(),
    queryFn: fetchAndMarkDelivered,
    enabled,
  })
