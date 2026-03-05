import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { LicensedItemRepository } from '@shared/domain/licensed-item/licensed-item.repository'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { LicensedItem } from './licensed-item.entity'

@Injectable()
export class LicensedItemService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly licensedItemRepository: LicensedItemRepository,
  ) {}

  async removeItemLicensedForNode(licenseableId: number): Promise<void> {
    this.logger.log(`Removing licensed item for entity with id: ${licenseableId} and type`)
    return await this.em.transactional(async () => {
      const licensedItems = await this.licensedItemRepository.getLicenseItemsForNode(licenseableId)
      licensedItems.forEach((licensedItem) => {
        this.em.remove(licensedItem)
      })
    })
  }

  async getLicensedItemsForNodes(licenseableIds: number[]): Promise<LicensedItem[]> {
    return await this.licensedItemRepository.find({
      licenseableId: { $in: licenseableIds },
    })
  }
}
