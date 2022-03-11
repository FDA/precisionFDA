
export interface EditableSpace {
  scope: string
  title: string
}
export type EditableSpacesResponse = EditableSpace[]

export async function fetchEditableSpacesList(): Promise<EditableSpacesResponse> {
    const res = await (await fetch(`/api/spaces/editable_spaces`)).json()
    return res
  }