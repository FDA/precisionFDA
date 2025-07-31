import { FilterQuery } from '@mikro-orm/mysql'
import { AccessControlRepository } from '@shared/database/repository/access-control.repository'
import { CHALLENGE_STATUS } from '@shared/domain/challenge/challenge.enum'
import { Uid } from '@shared/domain/entity/domain/uid'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { Challenge } from './challenge.entity'

class ChallengeRepository extends AccessControlRepository<Challenge> {
  private readonly PRE_REGISTRATION_SQL = `
    SELECT *
    FROM challenges
    WHERE MATCH(name, description, pre_registration_content)
                AGAINST(? IN NATURAL LANGUAGE MODE)
      AND status = 'pre-registration'
    ORDER BY MATCH(name, description, pre_registration_content)
                   AGAINST(? IN NATURAL LANGUAGE MODE) DESC
  `

  private readonly OPEN_PAUSED_ARCHIVED_SQL = `
    SELECT *
    FROM challenges
    WHERE MATCH(name, description, info_content)
                AGAINST(? IN NATURAL LANGUAGE MODE)
      AND status in ('open', 'paused', 'archived')
    ORDER BY MATCH(name, description, info_content)
                   AGAINST(? IN NATURAL LANGUAGE MODE) DESC
  `

  private readonly RESULT_ANNOUNCED_SQL = `
    SELECT *
    FROM challenges
    WHERE MATCH(name, description, info_content, results_content)
                AGAINST(? IN NATURAL LANGUAGE MODE)
      AND status = 'result_announced'
    ORDER BY MATCH(name, description, info_content, results_content)
                   AGAINST(? IN NATURAL LANGUAGE MODE) DESC
  `

  async searchPreRegistrationByNameAndDescriptionAndContents(query: string): Promise<Challenge[]> {
    return this.executeAndMapQuery(this.PRE_REGISTRATION_SQL, query)
  }

  async searchOpenPausedArchivedByNameAndDescriptionAndContents(
    query: string,
  ): Promise<Challenge[]> {
    return this.executeAndMapQuery(this.OPEN_PAUSED_ARCHIVED_SQL, query)
  }

  async searchResultAnnouncedByNameAndDescriptionAndContents(query: string): Promise<Challenge[]> {
    return this.executeAndMapQuery(this.RESULT_ANNOUNCED_SQL, query)
  }

  private async executeAndMapQuery(sql: string, query: string): Promise<Challenge[]> {
    const results = await this.em.execute(sql, [query, query])
    return results.map((row) => this.em.map(Challenge, row))
  }

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

  async findChallengesByCardImageFileUid(fileUid: Uid<'file'>): Promise<Challenge[]> {
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
