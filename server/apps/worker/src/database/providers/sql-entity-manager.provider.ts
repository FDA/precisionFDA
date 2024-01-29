import { MikroORM } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Provider, Scope } from '@nestjs/common'

export const sqlEntityManagerProvider: Provider = {
  provide: SqlEntityManager,
  inject: [MikroORM],
  useFactory: (orm: MikroORM) => orm.em.fork({ useContext: true }),
  scope: Scope.REQUEST,
}
