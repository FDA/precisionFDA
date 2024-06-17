import axios from 'axios'
import { RemovePayload, Resource } from './resources.types'

export const listDataPortalResourcesRequest = (id: string) =>
  axios
    .get(`/api/data_portals/${id}/resources`)
    .then(r => {
      return r.data as Resource[]
    })

export const removeResourceByIdRequest = ({ portalId, resourceId }: RemovePayload) =>
  axios
    .delete(`/api/data_portals/${portalId}/resources/${resourceId}`)
    .then(r => r.data)
