import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

interface CreateResourceResponse {
  fileUid: string
  id: number
}

interface CreateResourceBody {
  name: string
}

export const createResourceRequest = (portalId: string, body: CreateResourceBody) => axios.post(`/api/v2/data-portals/${portalId}/resources`, body).then(r => r.data as CreateResourceResponse)

export const useCreateResourceMutation = (portalId: string) => useMutation({
  mutationKey: ['create-resource'],
  mutationFn: (body: CreateResourceBody) => createResourceRequest(portalId, body),
})
