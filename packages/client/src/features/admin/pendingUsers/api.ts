import axios from 'axios'
import type { IFilter, MetaV2 } from '../../home/types'
import { type Params, prepareListFetchV2 } from '../../home/utils'

export type PendingUser = {
  id: number
  dxuser: string
  email: string
  createdAt: string
}

export type PendingUserListType = { data: PendingUser[]; meta: MetaV2 }

export const resendActivationEmail = async (userId: number): Promise<void> => {
  return await axios.post(`/api/v2/admin/users/${userId}/resend-activation-email`).then(res => res.data)
}

export async function fetchPendingUsers(filters: IFilter[], params: Params) {
  const query = prepareListFetchV2(filters, params)
  return axios.get<PendingUserListType>('/api/v2/admin/users/pending', { params: query }).then(res => res.data)
}
