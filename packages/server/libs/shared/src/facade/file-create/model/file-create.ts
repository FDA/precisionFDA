import { SCOPE } from '../../../types/common'

export interface FileCreate {
  project: string
  name: string
  scope: SCOPE
  description: string
}
