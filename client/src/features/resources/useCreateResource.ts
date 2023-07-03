import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

interface CreateResourceResponse {
  fileUid: string
  id: number
}

export const createResourceRequest = (portalId: string, name: string) => axios.post(`/api/data_portals/${portalId}/resources`, { name }).then(r => r.data as CreateResourceResponse)
export const createResourceLinkRequest = (portalId: string, resourceId: number) => axios.post(`/api/data_portals/${portalId}/resources/${resourceId}`)

export const useCreateResourceMutation = (portalId: string) => useMutation({
  mutationKey: ['create-resource'],
  mutationFn: ({ name }) => createResourceRequest(portalId, name),
})
