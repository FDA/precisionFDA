import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { EntityScope } from '@shared/types/common'
import { DxId } from '../entity/domain/dxid'
import { CliExchangeTokenRepository } from './cli-exchange-token.repository'

@Entity({ tableName: 'cli_exchange_tokens', repository: () => CliExchangeTokenRepository })
export class CliExchangeToken {
  @PrimaryKey()
  id!: number

  @Property({ nullable: true })
  dxid: DxId<'job'>

  @Property({ nullable: false })
  code: string

  @Property({ nullable: false })
  expiresAt: Date

  @Property({ nullable: false })
  encryptedKey: string

  @Property()
  scope: EntityScope

  @Property({ nullable: false })
  salt: string
}
