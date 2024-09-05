import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { fetchUserComputeInstances } from './apps.api'

export const useFetchComputeInstanceQuery = () => useQuery({
  queryKey: ['user-compute-instances'],
  queryFn: () => fetchUserComputeInstances().catch(() => toast.error('Error loading compute instances')),
})
