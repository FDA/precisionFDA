import { FilterQuery } from '@mikro-orm/mysql'
import { DxId } from '../entity/domain/dxid'
import { App } from './app.entity'
import { ENTITY_TYPE } from './app.enum'
import { AccessControlRepository } from '@shared/repository/access-control.repository'

export class AppRepository extends AccessControlRepository<App> {
  protected getAccessibleWhere(): Promise<FilterQuery<App>> {
    throw new Error('Method not implemented.')
  }

  protected getEditableWhere(): Promise<FilterQuery<App>> {
    throw new Error('Method not implemented.')
  }
  async findPublic(dxid: DxId<'app'>) {
    return await this.findOne({
      dxid,
      scope: 'public',
      entityType: ENTITY_TYPE.HTTPS,
      // todo: only of admin user
    })
  }
}
