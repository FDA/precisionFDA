import { SqlEntityManager } from '@mikro-orm/mysql'
import { ClientErrorProps, ServiceError } from '@shared/errors'
import { getLogger } from '@shared/logger'
import { PlatformClient } from '@shared/platform-client'
import { ClassIdResponse } from '@shared/platform-client/platform-client.responses'
import { getHandle } from '../org.utils'

const logger = getLogger('org.service')

export interface IOrgService {
  create: (dxid: string, billable?: boolean) => Promise<ClassIdResponse>
}

/**
 @deprecated - TO BE REMOVED.
  TODO: PFDA-5953
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
    } catch {
      return false
    }
  }

  async create(dxid: string, billable: boolean | undefined): Promise<ClassIdResponse> {
    logger.log(`Creating new organization ${dxid}, billable: ${billable}`)

    if (await this.exists(dxid)) {
      throw new ServiceError(`Org with dxid ${dxid} already exists`, {} as ClientErrorProps)
    }

    const handle = getHandle(dxid)
    const orgDxid = await this.adminPlatformClient.createOrg(handle, handle)

    // TODO add audit as in app/services/org_service/create.rb when implmenting auditing for Node

    if (billable) {
      await this.userPlatformClient.updateBillingInformation(orgDxid.id)
    }

    return orgDxid
  }
}
