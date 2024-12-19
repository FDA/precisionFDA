import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { Extends } from '@shared/utils/types/extends'

export type AttachableEntityType = Extends<
  EntityType,
  'file' | 'folder' | 'asset' | 'app' | 'job' | 'comparison'
>
