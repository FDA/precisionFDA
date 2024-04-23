/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { EntityRepository } from '@mikro-orm/mysql'
import { App } from './app.entity'
import { ENTITY_TYPE } from './app.enum'

export class AppRepository extends EntityRepository<App> {
  async findPublic(dxid: string) {
    return await this.findOne({
      dxid,
      scope: 'public',
      entityType: ENTITY_TYPE.HTTPS,
      // todo: only of admin user
    })
  }
}
