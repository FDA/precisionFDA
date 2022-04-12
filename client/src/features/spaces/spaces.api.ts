import { ISpace } from "./spaces.types"

export async function spacesListRequest(): Promise<{meta: any, spaces: ISpace[]}> {
  const res = await fetch(`/api/spaces`)
  return res.json()
}
export async function spaceRequest({ id }: { id: string }): Promise<{meta: any, spaces: ISpace}> {
  const res = await fetch(`/api/spaces/${id}`)
  return res.json()
}
