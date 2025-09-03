export interface SpaceGroupFormData {
  name: string
  description: string
}

export interface ISpaceGroupSpace {
  id: number
  name: string
  type: number
  isActiveMember: boolean
}

export interface ISpaceGroup {
  id: number
  description: string
  name: string
  spaces: ISpaceGroupSpace[]
}
