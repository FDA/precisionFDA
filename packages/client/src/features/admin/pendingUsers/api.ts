import axios from 'axios'
import { IFilter } from '../../home/types'
import { Params, prepareListFetchV2 } from '../../home/utils'
import { AdminUserListType } from '../users/types'

export const resendActivationEmail = async (userId: number): Promise<void> => {
  return await axios.post(`/api/v2/admin/users/${userId}/resend-activation-email`).then(res => res.data)
}

export async function fetchPendingUsers(filters: IFilter[], params: Params) {
  const query = prepareListFetchV2(filters, params)
  return axios.get<AdminUserListType>('/api/v2/admin/users/pending', { params: query }).then(res => res.data)
}
