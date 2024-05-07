import { EntityScope } from '@shared/types/common'

export interface FileCreate {
  project: string
  name: string
  scope: EntityScope
  description: string
}
