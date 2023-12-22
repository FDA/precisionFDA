import { SqlEntityManager } from '@mikro-orm/mysql'
import { Provider, Scope } from '@nestjs/common'
import { database } from '@shared'

export const sqlEntityManagerProvider: Provider = {
  provide: SqlEntityManager,
  useFactory: () => database.orm().em.fork({ useContext: true }),
  scope: Scope.REQUEST,
}
