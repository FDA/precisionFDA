import { Uid } from '@shared/domain/entity/domain/uid'
import { Challenge } from './challenge.entity'
import { AccessControlRepository } from '@shared/repository/access-control.repository'
import { FilterQuery } from '@mikro-orm/core'
import { User } from '@shared/domain/user/user.entity'
import { CHALLENGE_STATUS } from '@shared/domain/challenge/challenge.enum'
import { STATIC_SCOPE } from '@shared/enums'

class ChallengeRepository extends AccessControlRepository<Challenge> {
  protected async getAccessibleWhere(): Promise<FilterQuery<Challenge>> {
    const user = await this.em.findOne(User, { id: this.user.id })

    if (!user) {
      return {
        status: { $ne: CHALLENGE_STATUS.SETUP },
        scope: STATIC_SCOPE.PUBLIC,
      }
    }

    if (!(await user.isSiteOrChallengeAdmin())) {
      const accessibleSpaces = await user.accessibleSpaces()
      const spaceScopes = accessibleSpaces.map((space) => space.scope)
      return {
        status: { $ne: CHALLENGE_STATUS.SETUP },
        scope: { $in: [STATIC_SCOPE.PUBLIC, ...spaceScopes] },
      }
    } else {
      return {}
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<Challenge>> {
    const user = await this.em.findOne(User, { id: this.user.id })

    if (!user || !(await user.isSiteOrChallengeAdmin())) {
      return null
    } else {
      return {}
    }
  }

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
