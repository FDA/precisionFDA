import { EntityWithIconType } from '@shared/domain/entity/entity-icon/entity-with-icon.type'
import { EntityScope } from '@shared/types/common'

export interface EntityProvenanceData<T extends EntityWithIconType> {
  type: T
  title: string
  url: string
  identifier: string
  scope?: EntityScope
}
