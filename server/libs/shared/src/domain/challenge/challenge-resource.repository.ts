import { EntityRepository } from '@mikro-orm/mysql'
import { ChallengeResource } from '@shared/domain/challenge/challenge-resource.entity'

export class ChallengeResourceRepository extends EntityRepository<ChallengeResource> {
  async findChallengeResourcesByFileUid(fileUid: string) {
    return await this.createQueryBuilder('chr')
      .leftJoinAndSelect('chr.userFile', 'r')
      .where({ 'r.uid': fileUid })
      .getResult()
  }
}
