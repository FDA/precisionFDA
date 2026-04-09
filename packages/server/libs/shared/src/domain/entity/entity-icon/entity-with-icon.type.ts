import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { Extends } from '@shared/utils/types/extends'

export type EntityWithIconType = Extends<
  EntityType,
  'app' | 'asset' | 'comparison' | 'dbcluster' | 'file' | 'folder' | 'job' | 'note' | 'user' | 'workflow'
>
