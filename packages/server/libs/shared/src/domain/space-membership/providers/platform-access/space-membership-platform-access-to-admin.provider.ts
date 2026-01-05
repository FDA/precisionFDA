import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { PlatformClient } from '@shared/platform-client'
import { OrgMemberAccess } from '@shared/platform-client/platform-client.params'
import { SpaceMembershipPlatformAccessProvider } from './space-membership-platform-access.provider'

@Injectable()
export class SpaceMembershipPlatformAccessToAdminProvider extends SpaceMembershipPlatformAccessProvider {
  constructor(
    protected readonly em: SqlEntityManager,
    protected readonly platformClient: PlatformClient,
  ) {
    super(em, platformClient)
  }

  memberAccess: OrgMemberAccess = {
    level: 'ADMIN',
  }
}
