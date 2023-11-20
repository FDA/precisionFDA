import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { ResourceScope, PropertiesResource, ServerScope } from './types'

type FetchProperties = {
  keys: string[]
}

type PropertiesScope = ServerScope | 'spaces'

function fetchProperties(type: PropertiesResource, scope: PropertiesScope) {
  const url = `/api/properties/${type}/scope/${scope}/keys`
  return axios.get<FetchProperties>(url).then(r => r.data)
}
export const usePropertiesQuery = (type: PropertiesResource, scope?: ResourceScope, spaceId?: string) => {
  const map = {
    'me': 'private',
    'spaces': 'spaces',
    'everybody': 'public',
    'featured': 'public',
  }
  const mappingScope: PropertiesScope = spaceId ? `space-${spaceId}` : map[scope ?? 'me'] as 'private' | 'public' | 'spaces'
  return useQuery(
    ['edit-resource-properties', type, mappingScope],
    () => fetchProperties(type, mappingScope),
  )
}