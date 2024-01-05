import { SqlEntityManager } from '@mikro-orm/mysql'
import { Logger, Provider, Scope } from '@nestjs/common'
import { UserContext } from '@shared'
import { FileCloseOperation } from '@shared/domain/user-file'

export const fileCloseOperationProvider: Provider = {
  provide: FileCloseOperation,
  useFactory: (em: SqlEntityManager, log: Logger, user: UserContext) =>
    new FileCloseOperation({ em, log, user }),
  inject: [SqlEntityManager, Logger, UserContext],
  scope: Scope.TRANSIENT,
}
