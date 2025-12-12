import { useQuery } from '@tanstack/react-query'
import { fetchUserComputeInstances } from './apps.api'
import { toastError } from '../../components/NotificationCenter/ToastHelper'

export const useFetchComputeInstanceQuery = () =>
  useQuery({
    queryKey: ['user-compute-instances'],
    queryFn: () => fetchUserComputeInstances().catch(() => toastError('Error loading compute instances')),
  })
