import { EntityRepository } from '@mikro-orm/mysql'
import { Space } from './space.entity'

export class SpaceRepository extends EntityRepository<Space> {
  async findSpacesByIdAndUser(spaceIds: number[], userId: number): Promise<Space[]> {
    const qb = this.em.createQueryBuilder(Space, 'space')
    qb.select('space.*')
      .join('spaceMemberships', 'sm')
      .where({ 'space.id': spaceIds })
      .andWhere({ 'sm.user_id': userId })
    return await qb.execute()
  }
}
