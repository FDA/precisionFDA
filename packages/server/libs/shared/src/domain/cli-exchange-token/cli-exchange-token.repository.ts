import { EntityRepository } from '@mikro-orm/mysql'
import { CliExchangeToken } from './cli-exchange-token.entity'

export class CliExchangeTokenRepository extends EntityRepository<CliExchangeToken> {}
