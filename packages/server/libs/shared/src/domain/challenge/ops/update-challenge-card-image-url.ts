import { config } from '@shared/config'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { NotFoundError } from '@shared/errors'
import { BaseOperation } from '@shared/utils/base-operation'
import { OpsCtx } from '../../../types'
import { ChallengeRepository } from '../challenge.repository'
import { Challenge } from '../challenge.entity'
import { PlatformClient } from '../../../platform-client'
import { UserFileRepository } from '../../user-file/user-file.repository'

export class ChallengeUpdateCardImageUrlOperation extends BaseOperation<
OpsCtx,
number,
void
> {
  async run(challengeId: number): Promise<void> {
    const em = this.ctx.em
    const logger = this.ctx.log
    const repo = em.getRepository(Challenge) as ChallengeRepository
    const challenge = await repo.findOneWithId(challengeId)
    if (!challenge) {
      throw new NotFoundError(`ChallengeUpdateCardImageUrlOperation: Challenge ${challengeId} not found`)
    }

    if (!challenge.cardImageId) {
      throw new NotFoundError(`ChallengeUpdateCardImageUrlOperation: Challenge ${challengeId} has empty card_image_id`)
    }

    const fileRepo = em.getRepository(UserFile) as UserFileRepository
    const cardImage = await fileRepo.findFileWithUid(challenge.cardImageId)
    logger.log({ challengeId, cardImage }, `ChallengeUpdateCardImageUrlOperation: Updating ${challengeId} cardImage`)
    if (!cardImage) {
      throw new NotFoundError(`ChallengeUpdateCardImageUrlOperation: Cannot find card image id ${challenge.cardImageId} for challenge ${challengeId}`)
    }

    const platformClient = new PlatformClient(
      { accessToken: config.platform.challengeBotAccessToken },
      this.ctx.log,
    )
    const link = await platformClient.fileDownloadLink({
      fileDxid: cardImage.dxid,
      filename: cardImage.name,
      project: cardImage.project,
      duration: 9999999,
    })

    if (link.url) {
      logger.log({ link }, 'Updating cardImageUrl')
      challenge.cardImageUrl = link.url
      await em.flush()
    }
  }
}
