import { EntityIconType } from '@shared/domain/entity/entity-icon/entity-icon.type'

export interface EntityProvenanceData<T extends EntityIconType> {
  type: T
  title: string
  url: string
  identifier: string
}
