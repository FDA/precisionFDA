import { EntityType } from '../../entity'

export interface EntityProvenanceData<T extends EntityType> {
  type: T
  title: string
  url: string
}
