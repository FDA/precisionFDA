import { EntityRepository } from '@mikro-orm/mysql'
import { Uid } from '@shared/domain/entity/domain/uid'
import { Challenge } from './challenge.entity'

class ChallengeRepository extends EntityRepository<Challenge> {
  async findChallengesByCardImageFileUid(fileUid) {
    return await this.createQueryBuilder('ch')
      .leftJoinAndSelect('ch.cardImage', 'ci')
      .where({ 'ci.uid': fileUid })
      .getResult()
  }
  async findOneWithId(challengeId: number): Promise<Challenge | null> {
    return await this.findOne({ id: challengeId })
  }

  // Find a challenge using card image
  async findOneWithCardImageUid(cardImageUid: Uid<'file'>): Promise<Challenge | null> {
    return await this.findOne({ cardImageId: cardImageUid })
  }
}

export { ChallengeRepository }
