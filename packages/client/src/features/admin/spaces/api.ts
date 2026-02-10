import axios from 'axios'
import { ISpaceV2 } from '../../spaces/spaces.types'

export const bulkDelete = async (ids: ISpaceV2['id'][]) => {
  const res = await axios.delete('/api/v2/spaces', {
    data: { ids },
  })
  return res.data
}

export async function recoverSpaceLeadRequest(spaceId: number, currentLeadMembershipId: number, newLeadDxuser: string) {
  await axios.post(`/api/v2/spaces/${spaceId}/memberships/recover-lead`, {
    currentLeadMembershipId,
    newLeadDxuser,
  })
}
