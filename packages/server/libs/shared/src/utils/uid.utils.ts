import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { UId } from '@shared/domain/entity/domain/uid'
import { DxIdUtils } from '@shared/utils/dxid.utils'
import { StringUtils } from '@shared/utils/string.utils'

export class UidUtils {
  static isValidUId<T extends EntityType = EntityType>(
    value: string,
    entityType?: T,
  ): value is UId<T> {
    const lastDashIndex = value.lastIndexOf('-')

    if (lastDashIndex === -1) {
      return false
    }

    const dxid = value.substring(0, lastDashIndex)
    const id = value.substring(lastDashIndex + 1)

    return DxIdUtils.isDxIdValid(dxid, entityType) && StringUtils.isInteger(id)
  }
}
