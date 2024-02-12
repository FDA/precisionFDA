import { SqlEntityManager } from '@mikro-orm/mysql'
import { Logger, Provider, Scope } from '@nestjs/common'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NodesRemoveOperation } from '@shared/domain/user-file/ops/nodes-remove'
import { FileRemoveOperation } from '@shared/domain/user-file/ops/file-remove'

export const nodesRemoveOperationProvider: Provider = {
  provide: NodesRemoveOperation,
  useFactory: (em: SqlEntityManager, log: Logger, user: UserContext) =>
    new NodesRemoveOperation({ em, log, user }),
  inject: [SqlEntityManager, Logger, UserContext],
  scope: Scope.TRANSIENT,
}

export const fileRemoveOperationProvider: Provider = {
  provide: FileRemoveOperation,
  useFactory: (em: SqlEntityManager, log: Logger, user: UserContext) =>
    new FileRemoveOperation({ em, log, user }),
  inject: [SqlEntityManager, Logger, UserContext],
  scope: Scope.TRANSIENT,
}
