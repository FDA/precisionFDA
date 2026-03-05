import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useNavigate } from 'react-router'
import { BackendError } from '@/api/types'
import { toastError, toastSuccess } from '@/components/NotificationCenter/ToastHelper'
import { CreateDatabasePayload, createDatabaseRequest } from '@/features/databases/databases.api'

interface UseCreateDatabaseMutationProps {
  backPath: string
  spaceId?: number
}

export const useCreateDatabaseMutation = ({ backPath, spaceId }: UseCreateDatabaseMutationProps) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['create-database'],
    mutationFn: (payload: CreateDatabasePayload) => createDatabaseRequest(payload),
    onSuccess: res => {
      if (res?.uid) {
        navigate(`${backPath}/${res?.uid}`)
        queryClient.invalidateQueries({
          queryKey: ['dbclusters'],
        })
        if (spaceId) {
          queryClient.invalidateQueries({
            queryKey: ['space', spaceId.toString()],
          })
        } else {
          queryClient.invalidateQueries({
            queryKey: ['counters'],
          })
        }
        toastSuccess('Database was created successfully! It may take a up to 10 minutes for the database to be ready.')
      }
    },
    onError: (e: AxiosError<BackendError>) => {
      if (e.response?.data?.error?.message) {
        toastError(`Error: ${e.response.data.error.message}`)
      } else {
        toastError('Something went wrong when creating the database!')
      }
    },
  })
}
