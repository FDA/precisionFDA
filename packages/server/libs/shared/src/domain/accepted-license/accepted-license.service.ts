import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { License } from '@shared/domain/license/license.entity'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '../user-context/model/user-context'
import { AcceptedLicense } from './accepted-license.entity'
import { AcceptedLicenseRepository } from './accepted-license.repository'

@Injectable()
export class AcceptedLicenseService {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly userContext: UserContext,
    private readonly acceptedLicenseRepository: AcceptedLicenseRepository,
  ) {}

  async acceptLicenseForUser(): Promise<AcceptedLicense[]> {
    return await this.acceptedLicenseRepository.find({
      user: this.userContext.id,
    })
  }

  async isLicenseAcceptedForUser(licenseId: number): Promise<boolean> {
    const acceptedLicense = await this.acceptedLicenseRepository.findOne({
      user: this.userContext.id,
      license: licenseId,
    })
    return Boolean(acceptedLicense)
  }

  async getLicenseAcceptanceStatusForUser(licenseId: number): Promise<string | null> {
    const acceptedLicense = await this.acceptedLicenseRepository.findOne({
      user: this.userContext.id,
      license: licenseId,
    })

    return acceptedLicense?.state ?? null
  }

  async acceptIfNotYetAccepted(licenses: License[], user: User): Promise<void> {
    const licenseIds = licenses.map(l => l.id)

    await this.em.transactional(async em => {
      const existing = await em.find(AcceptedLicense, {
        license: { $in: licenseIds },
        user: user.id,
      })
      const existingIds = new Set(existing.map(al => al.license.id))

      for (const record of existing) {
        if (record.state !== 'active') {
          record.state = 'active'
        }
      }

      for (const license of licenses) {
        if (!existingIds.has(license.id)) {
          em.persist(new AcceptedLicense(license, user))
        }
      }
    })
  }
}
