import { UseBaseQueryOptions, useQuery } from '@tanstack/react-query'
import { AppFetchResponse, fetchApp } from './apps.api'

export const useFetchAppQuery = (appUid: string, options?: Partial<UseBaseQueryOptions<AppFetchResponse>>) => useQuery({
  queryFn: () => fetchApp(appUid),
  queryKey: ['app', appUid],
  ...options,
})
