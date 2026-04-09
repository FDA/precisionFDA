import { EntityManager, EntityName } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { AbstractCountService } from '@shared/domain/counters/abstract-count.service'
import { ScopeFilterProvider } from '@shared/domain/counters/counters.types'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { AssetScopeFilterProvider } from './asset-scope-filter.provider'

@Injectable()
export class AssetCountService extends AbstractCountService<Asset> {
  protected readonly em: EntityManager
  protected readonly scopeFilterProvider: ScopeFilterProvider<Asset>
  protected readonly entityClass: EntityName<Asset> = Asset

  constructor(em: SqlEntityManager, assetScopeFilterProvider: AssetScopeFilterProvider) {
    super()
    this.em = em
    this.scopeFilterProvider = assetScopeFilterProvider
  }
}
