import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { Extends } from '@shared/utils/types/extends'

export type DownloadableEntityType = Extends<EntityType, 'file' | 'asset'>
