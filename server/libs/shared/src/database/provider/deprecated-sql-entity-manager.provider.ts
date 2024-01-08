import { Provider, Scope } from '@nestjs/common'
import { database } from '@shared/database'

/**
 * @deprecated Use SqlEntityManager from '@mikro-orm/mysql' instead
 * This provider should not be used, as it does not create a contextual fork of the ORM.
 */
export const DEPRECATED_SQL_ENTITY_MANAGER_TOKEN = 'DEPRECATED_SQL_ENTITY_MANAGER_TOKEN'

export const deprecatedSqlEntityManagerProvider: Provider = {
  provide: DEPRECATED_SQL_ENTITY_MANAGER_TOKEN,
  useFactory: () => database.orm().em.fork(),
  scope: Scope.REQUEST,
}
