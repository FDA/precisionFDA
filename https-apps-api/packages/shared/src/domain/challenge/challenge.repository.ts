import { EntityRepository } from '@mikro-orm/mysql'
import { Challenge } from './challenge.entity'

class ChallengeRepository extends EntityRepository<Challenge> {
  async findOneWithId(challengeId: number): Promise<Challenge | null> {
    return await this.findOne({ id: challengeId })
  }

  // Find a challenge using card image
  async findOneWithCardImageUid(cardImageUid: string): Promise<Challenge | null> {
    return await this.findOne(
      { cardImageId: cardImageUid },
    )
  }
}

export {
  ChallengeRepository,
}
