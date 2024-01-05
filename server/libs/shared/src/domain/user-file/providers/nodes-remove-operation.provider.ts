import { SqlEntityManager } from '@mikro-orm/mysql'
import { Logger, Provider, Scope } from '@nestjs/common'
import { UserContext } from '@shared'
import { NodesRemoveOperation } from '@shared/domain/user-file'

export const nodesRemoveOperationProvider: Provider = {
  provide: NodesRemoveOperation,
  useFactory: (em: SqlEntityManager, log: Logger, user: UserContext) =>
    new NodesRemoveOperation({ em, log, user }),
  inject: [SqlEntityManager, Logger, UserContext],
  scope: Scope.TRANSIENT,
}
