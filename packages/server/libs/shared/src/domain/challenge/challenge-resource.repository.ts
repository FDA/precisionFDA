import { BaseEntityRepository } from '@shared/database/repository/base-entity.repository'
import { ChallengeResource } from '@shared/domain/challenge/challenge-resource.entity'

export class ChallengeResourceRepository extends BaseEntityRepository<ChallengeResource> {
  async findChallengeResourcesByFileUid(fileUid: string) {
    return await this.createQueryBuilder('chr')
      .leftJoinAndSelect('chr.userFile', 'r')
      .where({ 'r.uid': fileUid })
      .getResult()
  }
}
