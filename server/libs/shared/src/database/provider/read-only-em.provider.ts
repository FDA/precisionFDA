import { MikroORM } from '@mikro-orm/core'
import { getEntityManagerToken, getMikroORMToken } from '@mikro-orm/nestjs'
import { Provider, Scope } from '@nestjs/common'
import { DatabaseConnectionType } from '@shared/database/domain/database-connection.type'

export const readOnlySqlEntityManagerProvider: Provider = {
  provide: getEntityManagerToken(DatabaseConnectionType.READ_ONLY),
  inject: [getMikroORMToken(DatabaseConnectionType.READ_ONLY)],
  useFactory: (orm: MikroORM) => orm.em.fork(),
  scope: Scope.REQUEST,
}
