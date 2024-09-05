import { DXEnityType } from '@shared/domain/entity/domain/dxid'
import { Uid } from '@shared/domain/entity/domain/uid'
import { DxIdUtils } from '@shared/utils/dxid.utils'
import { StringUtils } from '@shared/utils/string.utils'

export class UidUtils {
  static isValidUId<T extends DXEnityType = DXEnityType>(
    value: string,
    entityType?: T,
  ): value is Uid<T> {
    const lastDashIndex = value.lastIndexOf('-')

    if (lastDashIndex === -1) {
      return false
    }

    const dxid = value.substring(0, lastDashIndex)
    const id = value.substring(lastDashIndex + 1)

    return DxIdUtils.isDxIdValid(dxid, entityType) && StringUtils.isInteger(id)
  }
}
