import { isString } from '@nestjs/common/utils/shared.utils'
import { DXEnityType, DxId } from '@shared/domain/entity/domain/dxid'
import { entityTypes } from '@shared/domain/entity/domain/entity.type'
import {
  PlatformEntityType,
  platformEntityTypes,
} from '@shared/domain/entity/domain/platform.entity.type'
import { StringUtils } from '@shared/utils/string.utils'

export class DxIdUtils {
  static isDxIdValid<T extends DXEnityType | PlatformEntityType = DXEnityType | PlatformEntityType>(
    value: string,
    entityType?: T,
  ): value is DxId<T> {
    if (!isString(value)) {
      return false
    }

    const parts = value.split('-')

    if (parts.length !== 2) {
      return false
    }

    const [entity, id] = parts

    if (entityType && entityType !== entity) {
      return false
    }

    const combinedEntityTypes: string[] = [...entityTypes, ...platformEntityTypes]

    if (!combinedEntityTypes.includes(entity)) {
      return false
    }

    return !StringUtils.isEmpty(id)
  }
}
