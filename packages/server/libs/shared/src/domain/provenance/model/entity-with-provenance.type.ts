import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { Extends } from '@shared/utils/types/extends'

export type EntityWithProvenanceType = Extends<
  EntityType,
  | 'app'
  | 'job'
  | 'file'
  | 'dbcluster'
  | 'user'
  | 'workflow'
  | 'note'
  | 'comparison'
  | 'asset'
  | 'folder'
>
