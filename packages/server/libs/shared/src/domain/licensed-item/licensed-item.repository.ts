import { EntityRepository } from '@mikro-orm/mysql'
import { License } from '../license/license.entity'
import { LicensedItem } from './licensed-item.entity'

export class LicensedItemRepository extends EntityRepository<LicensedItem> {
  async getLicenseItemsForNode(nodeId: number): Promise<LicensedItem[]> {
    return await this.find({
      licenseableId: nodeId,
      licenseableType: 'Node',
    })
  }

  async getLicensesForNode(nodeId: number): Promise<License[]> {
    const items = await this.find(
      {
        licenseableId: nodeId,
        licenseableType: 'Node',
      },
      {
        populate: ['license'],
      },
    )
    return items.map((item) => item.license.getEntity())
  }
}
