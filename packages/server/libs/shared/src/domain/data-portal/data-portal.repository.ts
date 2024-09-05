import { DataPortal } from '@shared/domain/data-portal/data-portal.entity'
import { EntityRepository } from '@mikro-orm/mysql'

export class DataPortalRepository extends EntityRepository<DataPortal> {
  async findDataPortalsByCardImageUid(fileUid: string) {
    return await this.createQueryBuilder('dp')
      .leftJoinAndSelect('dp.cardImage', 'ci')
      .where({ 'ci.uid': fileUid })
      .getResult()
  }
}
