import axios from 'axios'
import { RequestAccessPayload } from './type'

export const createRequestAccess = (data: RequestAccessPayload) => {
  return axios.post('/api/v2/request-access', data).then(response => response.data)
}
