import { SqlEntityManager } from '@mikro-orm/mysql'
import { Logger, Provider, Scope } from '@nestjs/common'
import { AuthSessionOperation } from '@shared/domain/auth/auth.session'

export const authSessionOperationProvider: Provider = {
  provide: AuthSessionOperation,
  useFactory: (em: SqlEntityManager, log: Logger) => new AuthSessionOperation({ em, log }),
  inject: [SqlEntityManager, Logger],
  scope: Scope.TRANSIENT,
}
