import { BaseEntityRepository } from '@shared/database/repository/base-entity.repository'
import { DataPortal } from '@shared/domain/data-portal/data-portal.entity'

export class DataPortalRepository extends BaseEntityRepository<DataPortal> {
  async findDataPortalsByCardImageUid(fileUid: string): Promise<DataPortal[]> {
    return await this.createQueryBuilder('dp')
      .leftJoinAndSelect('dp.cardImage', 'ci')
      .where({ 'ci.uid': fileUid })
      .getResult()
  }
}
