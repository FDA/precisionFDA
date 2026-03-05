import { Injectable } from '@nestjs/common'
import { UserContext } from '../user-context/model/user-context'
import { AcceptedLicense } from './accepted-license.entity'
import { AcceptedLicenseRepository } from './accepted-license.repository'

@Injectable()
export class AcceptedLicenseService {
  constructor(
    private readonly userContext: UserContext,
    private readonly acceptedLicenseRepository: AcceptedLicenseRepository,
  ) {}

  async acceptLicenseForUser(): Promise<AcceptedLicense[]> {
    const acceptedLicenses = await this.acceptedLicenseRepository.find({
      user: this.userContext.id,
    })

    return acceptedLicenses
  }

  async isLicenseAcceptedForUser(licenseId: number): Promise<boolean> {
    const acceptedLicense = await this.acceptedLicenseRepository.findOne({
      user: this.userContext.id,
      license: licenseId,
    })
    return Boolean(acceptedLicense)
  }
}
