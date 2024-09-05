import { Injectable, Logger } from '@nestjs/common'
import { ChallengeResourceRepository } from '@shared/domain/challenge/challenge-resource.repository'
import { ChallengeRepository } from '@shared/domain/challenge/challenge.repository'
import { DataPortalRepository } from '@shared/domain/data-portal/data-portal.repository'
import { Uid } from '@shared/domain/entity/domain/uid'
import { SpaceReportRepository } from '@shared/domain/space-report/repository/space-report.repository'

/**
 * Component that decides whether there will be another action
 * that would follow close file.
 */
@Injectable()
export class FollowUpDecider {
  constructor(
    private readonly logger: Logger,
    private readonly dataPortalRepo: DataPortalRepository,
    private readonly challengeResourceRepo: ChallengeResourceRepository,
    private readonly challengeRepo: ChallengeRepository,
    private readonly spaceReportRepo: SpaceReportRepository,
  ) {}

  async decideNextAction(fileUid: Uid<'file'>) {
    this.logger.log(`Deciding about follow up action after a close of file with uid ${fileUid}`)
    try {
      if (await this.isDataPortalCardImage(fileUid)) {
        return 'UPDATE_DATA_PORTAL_IMAGE_URL'
      }
      if (await this.isChallengeResource(fileUid)) {
        return 'UPDATE_CHALLENGE_RESOURCE_URL'
      }
      if (await this.isChallengeCardImage(fileUid)) {
        return 'UPDATE_CHALLENGE_IMAGE_URL'
      }
      if (await this.isSpaceReportResult(fileUid)) {
        return 'COMPLETE_SPACE_REPORT'
      }
    } catch (error) {
      this.logger.error(error)
      // TODO remove
      console.error(error)
    }
    return null
  }

  private async isDataPortalCardImage(fileUid: string) {
    this.logger.log(`Is file with uid ${fileUid} a data portal card image`)
    const dataPortals = await this.dataPortalRepo.findDataPortalsByCardImageUid(fileUid)
    return dataPortals.length > 0
  }

  private async isChallengeResource(fileUid: string) {
    this.logger.log(`Is file with uid ${fileUid} a challenge resource`)
    const challengeResources =
      await this.challengeResourceRepo.findChallengeResourcesByFileUid(fileUid)
    return challengeResources.length > 0
  }

  private async isChallengeCardImage(fileUid: string) {
    this.logger.log(`Is file with uid ${fileUid} a challenge card image`)
    const challenges = await this.challengeRepo.findChallengesByCardImageFileUid(fileUid)
    return challenges.length > 0
  }

  private async isSpaceReportResult(fileUid: Uid<'file'>) {
    this.logger.log(`Is file with uid ${fileUid} a space report result`)
    const spaceReports = await this.spaceReportRepo.findByResultFileUid(fileUid)
    return spaceReports != null
  }
}
