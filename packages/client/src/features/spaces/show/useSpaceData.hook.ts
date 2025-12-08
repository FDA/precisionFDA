import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router'
import { spaceRequest } from '../spaces.api'
import { ISpace } from '../spaces.types'


interface UseSpaceDataResult {
  space: ISpace | undefined
  isLoading: boolean
  isNotAllowed: boolean
  isLocked: boolean
}

export function useSpaceDataHook(): UseSpaceDataResult {
  const { spaceId } = useParams<{ spaceId: string }>()
  const [isNotAllowed, setIsNotAllowed] = useState<boolean>(false)
  const [isLocked, setIsLocked] = useState<boolean>(false)

  const { data, isLoading } = useQuery({
    queryKey: ['space', spaceId],
    queryFn: () => spaceRequest({ id: spaceId! }),
    retry: (failureCount, error: { response: { status: number } }) => {
      if (error.response.status === 403) {
        setIsNotAllowed(true)
        return false
      }
      if (error.response.status === 422) {
        setIsLocked(true)
        return false
      }
      return failureCount > 3
    },
  })

  return {
    space: data?.space,
    isLoading,
    isNotAllowed,
    isLocked,
  }
}
