import { EntityRepository } from '@mikro-orm/mysql'
import { Resource } from '@shared/domain/resource/resource.entity'

export class ResourceRepository extends EntityRepository<Resource> {
  async findResourcesByFileUid(fileUid: string) {
    return await this.createQueryBuilder('r')
      .leftJoinAndSelect('r.userFile', 'uf')
      .where({ 'uf.uid': fileUid })
      .getResult()
  }
}
