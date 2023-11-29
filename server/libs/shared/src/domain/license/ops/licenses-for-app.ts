import { entities } from '../..'
import { UidInput, UserOpsCtx } from '../../../types'
import { BaseOperation } from '../../../utils'
import { App } from '../../app'
import { License } from '../license.entity'
import { LicensedItem } from '../../licensed-item/licensed-item.entity'
import { LicensedItemRepository } from '../../licensed-item'

/**
 * Operation that gets licenses attached to all assets used by given application.
 * Input is application UID.
 */
export class LicensesForAppOperation extends BaseOperation<
UserOpsCtx,
UidInput,
License[]> {
  async run(input: UidInput): Promise<License[]> {
    const em = this.ctx.em
    const licensedItemRepo = em.getRepository(LicensedItem) as LicensedItemRepository

    const currentApp: App = await em.findOneOrFail(entities.App, { uid: input.uid })
    await currentApp.assets.init()

    const licensePromises = await Promise.all(currentApp.assets.getItems()
      .map(asset => licensedItemRepo.getLicenses(asset.id)))
    const licenses = (await Promise.all(licensePromises)).flat()

    // we don't want duplicates
    return [...new Map(licenses.map(item => [item.id, item])).values()]
  }
}
