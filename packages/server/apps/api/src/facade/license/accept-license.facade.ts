import { Injectable } from '@nestjs/common'
import { AcceptedLicenseService } from '@shared/domain/accepted-license/accepted-license.service'
import { LicenseService } from '@shared/domain/license/license.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NotFoundError, ValidationError } from '@shared/errors'

@Injectable()
export class AcceptLicenseFacade {
  constructor(
    private readonly userContext: UserContext,
    private readonly licenseService: LicenseService,
    private readonly acceptedLicenseService: AcceptedLicenseService,
  ) {}

  async accept(licenseId: number): Promise<void> {
    try {
      await this.acceptMany([licenseId])
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw new NotFoundError(`License with id ${licenseId} not found or not accessible`)
      }
      throw e
    }
  }

  async acceptMany(licenseIds: number[]): Promise<number[]> {
    if (licenseIds.length === 0) {
      throw new ValidationError('licenseIds must be a non-empty array')
    }

    const uniqueIds = [...new Set(licenseIds)]
    const user = await this.userContext.loadEntity()

    const licenses = await this.licenseService.findAccessibleByIds(uniqueIds)

    if (licenses.length !== uniqueIds.length) {
      throw new NotFoundError('Some licenseIds do not exist or are not accessible')
    }

    const requiresApproval = licenses.filter(l => l.approvalRequired)
    if (requiresApproval.length > 0) {
      throw new ValidationError('Some licenses require manual approval and cannot be accepted directly')
    }

    await this.acceptedLicenseService.acceptIfNotYetAccepted(licenses, user)

    return uniqueIds
  }
}
