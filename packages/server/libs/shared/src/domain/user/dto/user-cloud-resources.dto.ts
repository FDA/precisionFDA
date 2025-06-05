import { CloudResourcesResponse } from '@shared/platform-client/platform-client.responses'
import { User } from '@shared/domain/user/user.entity'

export class UserCloudResourcesDTO {
  computeCharges: number
  storageCharges: number
  dataEgressCharges: number
  totalCharges: number
  usageLimit: number
  jobLimit: number
  usageAvailable: number

  constructor(response: CloudResourcesResponse, user: User) {
    this.computeCharges = Math.max(
      response.computeCharges - user.cloudResourceSettings.charges_baseline.computeCharges,
      0,
    )
    this.storageCharges = Math.max(
      response.storageCharges - user.cloudResourceSettings.charges_baseline.storageCharges,
      0,
    )
    this.dataEgressCharges = Math.max(
      response.dataEgressCharges - user.cloudResourceSettings.charges_baseline.dataEgressCharges,
      0,
    )
    this.totalCharges =
      response.computeCharges + response.storageCharges + response.dataEgressCharges
    this.usageLimit = user.cloudResourceSettings.total_limit
    this.jobLimit = user.cloudResourceSettings.job_limit
    this.usageAvailable = Math.max(this.usageLimit - this.totalCharges, 0)
  }
}
