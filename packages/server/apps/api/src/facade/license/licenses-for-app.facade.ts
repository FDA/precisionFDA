import { Injectable } from '@nestjs/common'
import { AppService } from '@shared/domain/app/services/app.service'
import { Uid } from '@shared/domain/entity/domain/uid'
import { License } from '@shared/domain/license/license.entity'
import { LicenseService } from '@shared/domain/license/license.service'
import { NotFoundError } from '@shared/errors'

@Injectable()
export class LicensesForAppFacade {
  constructor(
    private readonly appService: AppService,
    private readonly licenseService: LicenseService,
  ) {}

  async findLicensesForApp(uid: Uid<'app'>): Promise<License[]> {
    const app = await this.appService.getAccessibleEntityByUid(uid)
    if (!app) {
      throw new NotFoundError(`App not found ({ uid: '${uid}' })`)
    }
    await app.assets.init()
    const assetIds = app.assets.getItems().map((asset) => asset.id)
    return this.licenseService.findLicensesForNodeIds(assetIds)
  }
}
