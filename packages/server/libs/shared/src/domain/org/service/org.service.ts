import { SqlEntityManager } from '@mikro-orm/mysql'
import { getLogger } from '@shared/logger'
import { PlatformClient } from '../../../platform-client'
import { getHandle } from '../org.utils'
import { ClientErrorProps, ServiceError } from '../../../errors'
import { BILLING_INFO } from '../../../config/consts'

const logger = getLogger('org.service')

export interface IOrgService {
  create: (dxid: string, billable?: boolean) => Promise<string>
}

/**
 * Org service should be initialized with admin access token (config.platform.adminUserAccessToken)
 */
export class OrgService implements IOrgService {
  private em: SqlEntityManager
  private adminPlatformClient: PlatformClient
  private userPlatformClient: PlatformClient

  constructor(
    em: SqlEntityManager,
    adminPlatformClient: PlatformClient,
    userPlatformClient: PlatformClient,
  ) {
    this.em = em
    this.adminPlatformClient = adminPlatformClient
    this.userPlatformClient = userPlatformClient
  }

  private exists = async (dxid: string) => {
    try {
      await this.adminPlatformClient.objectDescribe(dxid)
      return true
    } catch (error) {
      return false
    }
  }

  async create(dxid: string, billable: boolean | undefined): Promise<string> {
    logger.log(`Creating new organization ${dxid}, billable: ${billable}`)

    if (await this.exists(dxid)) {
      throw new ServiceError(`Org with dxid ${dxid} already exists`, {} as ClientErrorProps)
    }

    const handle = getHandle(dxid)
    const orgDxid = await this.adminPlatformClient.createOrg(handle, handle)

    // TODO add audit as in app/services/org_service/create.rb when implmenting auditing for Node

    if (billable) {
      await this.userPlatformClient.updateBillingInformation(orgDxid, BILLING_INFO)
    }

    return orgDxid
  }
}
