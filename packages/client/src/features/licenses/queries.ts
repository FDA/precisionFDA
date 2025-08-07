import { useQuery } from '@tanstack/react-query'
import { fetchLicensesList } from './api'

export const useLicensesListQuery = () => {
  return useQuery({
    queryKey: ['licenses'],
    queryFn: fetchLicensesList,
  })
}
