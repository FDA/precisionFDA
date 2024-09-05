import { SqlEntityManager } from '@mikro-orm/mysql'
import { Logger, Provider, Scope } from '@nestjs/common'
import { EmailProcessOperation } from '@shared/domain/email/ops/email-process'

export const emailProcessProvider: Provider = {
  provide: EmailProcessOperation,
  useFactory: (em: SqlEntityManager, log: Logger) => {
    return new EmailProcessOperation({ em, log, user: null })
  },
  inject: [SqlEntityManager, Logger],
  scope: Scope.TRANSIENT,
}
