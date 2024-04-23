import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export interface Asset {
  id: number
  uid: string
  className: string
  fa_class: string
  scope: string
  path: string
  owned: boolean
  editable: boolean
  accessible: boolean
  file_path: string
  parent_folder_name: string
  public: boolean
  private: boolean
  in_space: boolean
  space_private: boolean
  space_public: boolean
  title: string
  name: string
  prefix: string
  description: string
  file_paths: string[]
  content? : string
}

type ListAssetsResponse = Asset[]

export async function listAssetsRequest() {
  return axios.post('/api/list_assets').then(r => r.data as ListAssetsResponse)
}

export const useListAssetsQuery = () => useQuery({
  queryKey: ['list-assets'],
  queryFn: () => listAssetsRequest(),
})
