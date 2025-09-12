import { Inject, Injectable, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { ADMIN_PLATFORM_CLIENT } from '@shared/platform-client/providers/admin-platform-client.provider'

@Injectable()
export class UserSpaceInconsistencyFixService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly platformClient: PlatformClient,
    @Inject(ADMIN_PLATFORM_CLIENT)
    private readonly adminClient: PlatformClient,
  ) {}
  async correctSpaceBillTo(billTo: string, projectDxid: DxId<'project'>): Promise<void> {
    try {
      this.logger.log(`Correcting space billTo for project ${projectDxid}`)
      await this.adminClient.projectUpdate(projectDxid, { billTo })
    } catch (error) {
      this.logger.error(`Update project billTo failed: ${error.message}`)
    }
  }

  async inviteAdminUserToOrg(org: string): Promise<void> {
    try {
      this.logger.log(`Inviting admin user to space org ${org}`)
      await this.platformClient.inviteUserToOrganization({
        orgDxId: org,
        data: {
          invitee: `user-${config.platform.adminUser}`,
          level: 'ADMIN',
          suppressEmailNotification: true,
        },
      })
    } catch (error) {
      this.logger.error(`Invite admin user to space org failed: ${error.message}`)
    }
  }
}
