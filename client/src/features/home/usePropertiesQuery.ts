import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { HomeScope, PropertiesResource, ServerScope } from './types'

export type FetchProperties = {
  keys: string[]
}

type PropertiesScope = ServerScope | 'spaces'

async function fetchProperties(type: PropertiesResource, scope: PropertiesScope) {
  const url = `/api/properties/${type}/scope/${scope}/keys`
  const r = await axios.get<FetchProperties>(url)
  return r.data
}
export const usePropertiesQuery = (type: PropertiesResource, homeScope?: HomeScope, spaceId?: string) => {
  const map = {
    'me': 'private',
    'spaces': 'spaces',
    'everybody': 'public',
    'featured': 'public',
  }
  const mappingScope: PropertiesScope = spaceId ? `space-${spaceId}` : map[homeScope ?? 'me'] as 'private' | 'public' | 'spaces'
  return useQuery({
    queryKey: ['edit-resource-properties', type, mappingScope],
    queryFn: () => fetchProperties(type, mappingScope),
  })
}