import { useQuery } from '@tanstack/react-query'
import { fetchApp } from './apps.api'

export const useFetchAppQuery = (appUid: string) => useQuery({
  queryFn: () => fetchApp(appUid),
  queryKey: ['app', appUid],
})
