import { FindOptions } from '@mikro-orm/core'
import { FilterQuery, Loaded, SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { LicensedItemRepository } from '@shared/domain/licensed-item/licensed-item.repository'
import { User } from '@shared/domain/user/user.entity'
import { ArchiveEntry } from '@shared/domain/user-file/archive-entry.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { AssetRepository } from '@shared/domain/user-file/asset.repository'
import { AssetCreate } from '@shared/domain/user-file/domain/asset-create'
import { ASSET_VALIDATION_ERROR, ValidationError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PARENT_TYPE } from '../user-file.types'

@Injectable()
export class AssetService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly licensedItemRepo: LicensedItemRepository,
    private readonly assetRepository: AssetRepository,
  ) {}

  /**
   * Creates an open Asset together with its archive entries (one per path in the
   * archive). Mirrors the Rails AssetService#create behaviour, including the
   * self-referential parent (parentType = Asset, parentId = own id).
   */
  async createAsset(assetCreate: AssetCreate, paths: string[]): Promise<Asset> {
    const asset = new Asset(this.em.getReference(User, assetCreate.userId))
    asset.dxid = assetCreate.dxid
    asset.project = assetCreate.project
    asset.name = assetCreate.name
    asset.state = assetCreate.state
    asset.description = assetCreate.description
    asset.scope = assetCreate.scope
    asset.uid = `${assetCreate.dxid}-1`
    asset.parentType = PARENT_TYPE.ASSET

    this.logger.log(`Creating asset ${asset.uid} with ${paths.length} archive entries`)

    await this.em.transactional(async em => {
      // Persist first so the asset receives an id, then point its polymorphic
      // parent at itself - mirrors Rails AssetService#create.
      await em.persist(asset).flush()
      asset.parentId = asset.id

      paths.forEach(path => {
        const archiveEntry = new ArchiveEntry()
        archiveEntry.asset = asset
        archiveEntry.path = path
        archiveEntry.name = this.archiveEntryName(path)
        em.persist(archiveEntry)
      })
      await em.flush()
    })

    return asset
  }

  async listAccessibleAssets<Hint extends string = never, Fields extends string = '*', Excludes extends string = never>(
    where: FilterQuery<Asset>,
    options?: Omit<FindOptions<Asset, Hint, Fields, Excludes>, 'limit' | 'offset'>,
  ): Promise<Loaded<Asset, Hint, Fields, Excludes>[]> {
    return this.assetRepository.findAccessible(where, options)
  }

  /**
   * An asset cannot be deleted if it has an attached license and is associated with an app.
   */
  async validateAssetRemoval(assetToRemove: Asset): Promise<void> {
    await this.em.populate(assetToRemove, ['apps'])
    const licenseItems = await this.licensedItemRepo.getLicenseItemsForNode(assetToRemove.id)

    if (assetToRemove.apps.count() > 0 && licenseItems.length > 0) {
      throw new ValidationError(ASSET_VALIDATION_ERROR)
    }
  }

  private archiveEntryName(path: string): string | undefined {
    const segments = path.split('/').filter(segment => segment !== '')
    const name = segments[segments.length - 1]
    if (name === undefined || name === '.' || name === '..') {
      return undefined
    }
    return name
  }
}
