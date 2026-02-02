import { FilterQuery } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import { AbstractScopeFilterProvider } from '@shared/domain/counters/abstract-scope-filter.provider'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { FILE_STATE_PFDA, FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'

/**
 * Scope filter provider for Asset entities.
 * Adds base conditions to filter out non-assets and removing assets.
 */
@Injectable()
export class AssetScopeFilterProvider extends AbstractScopeFilterProvider<Asset> {
  protected override getBaseCondition(): Partial<FilterQuery<Asset>> {
    return {
      stiType: FILE_STI_TYPE.ASSET,
      state: { $ne: FILE_STATE_PFDA.REMOVING },
    }
  }
}
