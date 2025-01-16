import { Uid } from '@shared/domain/entity/domain/uid'
import { PaginatedRepository } from '@shared/domain/entity/repository/paginated.repository'
import { Challenge } from './challenge.entity'

class ChallengeRepository extends PaginatedRepository<Challenge> {
  async findChallengesByCardImageFileUid(fileUid: Uid<'file'>) {
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
