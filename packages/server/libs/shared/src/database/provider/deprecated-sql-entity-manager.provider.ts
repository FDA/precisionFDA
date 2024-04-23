import { MikroORM } from '@mikro-orm/core'
import { Provider, Scope } from '@nestjs/common'

/**
 * @deprecated Use SqlEntityManager from '@mikro-orm/mysql' instead
 * This provider should not be used, as it does not create a contextual fork of the ORM.
 */
export const DEPRECATED_SQL_ENTITY_MANAGER = 'DEPRECATED_SQL_ENTITY_MANAGER'

export const deprecatedSqlEntityManagerProvider: Provider = {
  provide: DEPRECATED_SQL_ENTITY_MANAGER,
  inject: [MikroORM],
  useFactory: (orm: MikroORM) => orm.em.fork(),
  scope: Scope.REQUEST,
}
