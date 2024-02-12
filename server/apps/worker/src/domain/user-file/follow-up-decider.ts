import { Injectable, Logger } from '@nestjs/common'
import { ChallengeResourceRepository } from '@shared/domain/challenge/challenge-resource.repository'
import { ChallengeRepository } from '@shared/domain/challenge/challenge.repository'
import { DataPortalRepository } from '@shared/domain/data-portal/data-portal.repository'
import { ResourceRepository } from '@shared/domain/resource/resource.repository'
import { SpaceReportRepository } from '@shared/domain/space-report/repository/space-report.repository'

/**
 * Component that decides whether there will be another action
 * that would follow close file.
 */
@Injectable()
export class FollowUpDecider {
  constructor(
    private readonly logger: Logger,
    private readonly resourceRepo: ResourceRepository,
    private readonly dataPortalRepo: DataPortalRepository,
    private readonly challengeResourceRepo: ChallengeResourceRepository,
    private readonly challengeRepo: ChallengeRepository,
    private readonly spaceReportRepo: SpaceReportRepository,
  ) {}

  async decideNextAction(fileUid: string) {
    this.logger.verbose(`Deciding about follow up action after a close of file with uid ${fileUid}`)
    try {
      if (await this.isDataPortalResource(fileUid)) {
        return 'UPDATE_DATA_PORTAL_RESOURCE_URL'
      }
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

  private async isDataPortalResource(fileUid: string) {
    this.logger.verbose(`Is file with uid ${fileUid} a data portal resource`)
    const resources = await this.resourceRepo.findResourcesByFileUid(fileUid)
    return resources.length > 0
  }

  private async isDataPortalCardImage(fileUid: string) {
    this.logger.verbose(`Is file with uid ${fileUid} a data portal card image`)
    const dataPortals = await this.dataPortalRepo.findDataPortalsByCardImageUid(fileUid)
    return dataPortals.length > 0
  }

  private async isChallengeResource(fileUid: string) {
    this.logger.verbose(`Is file with uid ${fileUid} a challenge resource`)
    const challengeResources =
      await this.challengeResourceRepo.findChallengeResourcesByFileUid(fileUid)
    return challengeResources.length > 0
  }

  private async isChallengeCardImage(fileUid: string) {
    this.logger.verbose(`Is file with uid ${fileUid} a challenge card image`)
    const challenges = await this.challengeRepo.findChallengesByCardImageFileUid(fileUid)
    return challenges.length > 0
  }

  private async isSpaceReportResult(fileUid: string) {
    this.logger.verbose(`Is file with uid ${fileUid} a space report result`)
    const spaceReports = await this.spaceReportRepo.findByResultFileUid(fileUid)
    return spaceReports != null
  }
}
