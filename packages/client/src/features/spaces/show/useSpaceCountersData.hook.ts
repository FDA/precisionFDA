import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { spaceCountersRequest } from '../spaces.api'
import { Counters } from '../spaces.types'

interface UseSpaceCountersDataResult {
  counters: Counters | undefined
}

export function useSpaceCountersDataHook(): UseSpaceCountersDataResult {
  const { spaceId } = useParams<{ spaceId: string }>()

  const { data: counters } = useQuery({
    queryKey: ['space', spaceId, 'counters'],
    queryFn: () => spaceCountersRequest(spaceId!),
    enabled: !!spaceId,
  })

  return {
    counters,
  }
}
