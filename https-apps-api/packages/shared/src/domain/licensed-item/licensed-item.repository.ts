import { EntityRepository } from '@mikro-orm/mysql'
import { License } from '../license/license.entity'
import { LicensedItem } from './licensed-item.entity'

export class LicensedItemRepository extends EntityRepository<LicensedItem> {
  async getLicenses(assetId: number): Promise<License[]> {
    const [items] = await this.findAndCount({
      licenseableId: assetId, licenseableType: 'Node',
    }, {
      populate: ['license'],
    })
    return items.map(item => item.license.getEntity())
  }
}
