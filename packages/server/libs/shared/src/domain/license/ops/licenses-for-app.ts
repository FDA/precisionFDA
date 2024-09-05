import { App } from '@shared/domain/app/app.entity'
import { Uid } from '@shared/domain/entity/domain/uid'
import { LicensedItemRepository } from '@shared/domain/licensed-item/licensed-item.repository'
import { BaseOperation } from '@shared/utils/base-operation'
import { UidInput, UserOpsCtx } from '../../../types'
import { LicensedItem } from '../../licensed-item/licensed-item.entity'
import { License } from '../license.entity'

/**
 * Operation that gets licenses attached to all assets used by given application.
 * Input is application UID.
 */
export class LicensesForAppOperation extends BaseOperation<UserOpsCtx, UidInput, License[]> {
  async run(input: UidInput): Promise<License[]> {
    const em = this.ctx.em
    const licensedItemRepo = em.getRepository(LicensedItem) as LicensedItemRepository

    const currentApp: App = await em.findOneOrFail(App, { uid: input.uid as Uid<'app'> })
    await currentApp.assets.init()

    const licensePromises = await Promise.all(
      currentApp.assets.getItems().map((asset) => licensedItemRepo.getLicenses(asset.id)),
    )
    const licenses = (await Promise.all(licensePromises)).flat()

    // we don't want duplicates
    return [...new Map(licenses.map((item) => [item.id, item])).values()]
  }
}
