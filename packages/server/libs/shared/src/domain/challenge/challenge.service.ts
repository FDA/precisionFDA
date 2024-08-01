import { SqlEntityManager } from '@mikro-orm/mysql'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { NotFoundError } from '@shared/errors'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { PlatformClient } from '@shared/platform-client'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { ChallengeRepository } from '@shared/domain/challenge/challenge.repository'
import { ChallengeResourceRepository } from '@shared/domain/challenge/challenge-resource.repository'
import { CHALLENGE_BOT_PLATFORM_CLIENT } from '@shared/platform-client/providers/platform-client.provider'

@Injectable()
export class ChallengeService {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly logger: Logger,
    @Inject(CHALLENGE_BOT_PLATFORM_CLIENT) private readonly platformClient: PlatformClient,
    private readonly notificationService: NotificationService,
    private readonly challengeRepo: ChallengeRepository,
    private readonly challengeResourceRepo: ChallengeResourceRepository,
  ) {}

  /**
   * Updates the card image url for a data portal
   * @param fileUid
   */
  async updateCardImageUrl(fileUid: string) {
    this.logger.log(`Updating card image url for fileUid ${fileUid}`)
    const challenges = await this.challengeRepo.findChallengesByCardImageFileUid(fileUid)

    if (challenges.length === 0) {
      throw new NotFoundError(`Challenge for fileUid ${fileUid} was not found`)
    }
    const challenge = challenges[0]
    const cardImage = challenge.cardImage.getEntity()

    const link = await this.platformClient.fileDownloadLink({
      fileDxid: cardImage.dxid,
      filename: cardImage.name,
      project: cardImage.project,
      duration: 9999999999,
    })

    challenge.cardImageUrl = link.url

    await this.em.flush()
    this.logger.log(`Card image url for fileUid ${fileUid} updated`)
    try {
      const userId = this.user.id
      await this.notificationService.createNotification({
        message: `Card image url for ${challenge.name} has been updated`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.CHALLENGE_CARD_IMAGE_URL_UPDATED,
        userId,
      })
    } catch (error) {
      this.logger.error(`Error creating notification ${error}`)
    }
  }

  /**
   * Updates the resource url for Challenge resource.
   */
  async updateResourceUrl(fileUid: string) {
    this.logger.log(`Updating resource url for fileUid ${fileUid}`)
    const challengeResources =
      await this.challengeResourceRepo.findChallengeResourcesByFileUid(fileUid)

    if (challengeResources.length === 0) {
      throw new NotFoundError(`Challenge resource for fileUid ${fileUid} was not found`)
    }
    const challengeResource = challengeResources[0]
    const userFile = challengeResource.userFile.getEntity()

    const link = await this.platformClient.fileDownloadLink({
      fileDxid: userFile.dxid,
      filename: userFile.name,
      project: userFile.project,
      duration: 9999999999,
    })

    challengeResource.url = link.url

    await this.em.flush()
    this.logger.log(`Resource url for fileUid ${fileUid} updated`)

    try {
      const userId = this.user.id
      await this.notificationService.createNotification({
        message: `Resource url for ${challengeResource.name} has been updated`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.CHALLENGE_RESOURCE_URL_UPDATED,
        userId,
      })
    } catch (error) {
      this.logger.error(`Error creating notification ${error}`)
    }
  }
}
