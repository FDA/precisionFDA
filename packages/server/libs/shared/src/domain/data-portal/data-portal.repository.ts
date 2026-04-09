import { EntityRepository } from '@mikro-orm/mysql'
import { DataPortal } from '@shared/domain/data-portal/data-portal.entity'

export class DataPortalRepository extends EntityRepository<DataPortal> {
  async findDataPortalsByCardImageUid(fileUid: string): Promise<DataPortal[]> {
    return await this.createQueryBuilder('dp')
      .leftJoinAndSelect('dp.cardImage', 'ci')
      .where({ 'ci.uid': fileUid })
      .getResult()
  }
}
