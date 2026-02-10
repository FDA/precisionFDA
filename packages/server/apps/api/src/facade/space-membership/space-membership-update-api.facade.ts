import { Injectable } from '@nestjs/common'
import { SpaceLeadRecoverDTO } from '@shared/domain/space-membership/dto/space-lead-recover.dto'
import { UpdateSpaceMembershipDTO } from '@shared/domain/space-membership/dto/update-space-membership.dto'
import { SpaceMembershipUpdateFacade } from '@shared/facade/space-membership/space-membership-update.facade'
import { DbClusterSynchronizeFacade } from '../db-cluster/synchronize-facade/db-cluster-synchronize.facade'

@Injectable()
export class SpaceMembershipUpdateApiFacade {
  constructor(
    private readonly spaceMembershipUpdateFacade: SpaceMembershipUpdateFacade,
    private readonly dbClusterSynchronizeFacade: DbClusterSynchronizeFacade,
  ) {}

  async updatePermissions(spaceId: number, body: UpdateSpaceMembershipDTO): Promise<void> {
    await this.spaceMembershipUpdateFacade.updatePermissions(spaceId, body)
    await this.dbClusterSynchronizeFacade.synchronizeInSpace(spaceId)
  }

  async recoverLeadByAdmin(spaceId: number, dto: SpaceLeadRecoverDTO): Promise<void> {
    await this.spaceMembershipUpdateFacade.recoverSpaceLead(
      spaceId,
      dto.currentLeadMembershipId,
      dto.newLeadDxuser,
    )
    await this.dbClusterSynchronizeFacade.synchronizeInSpace(spaceId)
  }
}
