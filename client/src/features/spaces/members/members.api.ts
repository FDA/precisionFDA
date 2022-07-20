import { SideRole } from '../spaces.types'
import { ListMembersResponse } from './members.types'

export async function spacesMembersListRequest({ spaceId, sideRole }: { spaceId: string, sideRole?: SideRole }): Promise<ListMembersResponse> {
  const paramQ = `?${  new URLSearchParams({ side: sideRole } as Record<string, SideRole>).toString()}`

  const res = await fetch(`/api/spaces/${spaceId}/members${paramQ}`)
  return res.json()
}
