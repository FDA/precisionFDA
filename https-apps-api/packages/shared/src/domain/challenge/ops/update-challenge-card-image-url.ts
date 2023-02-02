import { BaseOperation } from '../../../utils'
import { OpsCtx } from '../../../types'
import { config, errors } from '../../..'
import { ChallengeRepository } from '../challenge.repository'
import { Challenge } from '../challenge.entity'
import { PlatformClient } from '../../../platform-client'
import { UserFile } from '../../user-file'
import { UserFileRepository } from '../../user-file/user-file.repository'


export class ChallengeUpdateCardImageUrlOperation extends BaseOperation<
OpsCtx,
number,
void
> {
  async run(challengeId: number): Promise<void> {
    const em = this.ctx.em
    const log = this.ctx.log
    const repo = em.getRepository(Challenge) as ChallengeRepository
    const challenge = await repo.findOneWithId(challengeId)
    if (!challenge) {
      throw new errors.NotFoundError(`ChallengeUpdateCardImageUrlOperation: Challenge ${challengeId} not found`)
    }

    if (!challenge.cardImageId) {
      throw new errors.NotFoundError(`ChallengeUpdateCardImageUrlOperation: Challenge ${challengeId} has empty card_image_id`)
    }

    const fileRepo = em.getRepository(UserFile) as UserFileRepository
    const cardImage = await fileRepo.findFileWithUid(challenge.cardImageId)
    log.info({ challengeId, cardImage }, `ChallengeUpdateCardImageUrlOperation: Updating ${challengeId} cardImage`)
    if (!cardImage) {
      throw new errors.NotFoundError(`ChallengeUpdateCardImageUrlOperation: Cannot find card image id ${challenge.cardImageId} for challenge ${challengeId}`)
    }

    const platformClient = new PlatformClient(config.platform.challengeBotAccessToken, this.ctx.log)
    const link = await platformClient.fileDownloadLink({
      fileDxid: cardImage.dxid,
      filename: cardImage.name,
      project: cardImage.project,
      duration: 9999999,
    })

    if (link.url) {
      log.info({ link }, 'ChallengeUpdateCardImageUrlOperation: Updating cardImageUrl')
      challenge.cardImageUrl = link.url
      em.flush()
    }
  }
}
