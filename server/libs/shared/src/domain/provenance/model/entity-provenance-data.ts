import { EntityType } from '@shared/domain/entity/domain/entity.type'

export interface EntityProvenanceData<T extends EntityType> {
  type: T
  title: string
  url: string
  identifier: string
}
