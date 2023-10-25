import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { fetchUserComputeInstances } from './apps.api'

export const useFetchComputeInstanceQuery = () => useQuery(
  ['user-compute-instances'],
  () => fetchUserComputeInstances(),
  {
    onError: () => {
      toast.error('Error loading compute instances')
    },
  },
)
