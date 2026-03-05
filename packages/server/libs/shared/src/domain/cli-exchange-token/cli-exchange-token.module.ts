import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { CliExchangeToken } from './cli-exchange-token.entity'
import { CliExchangeTokenService } from './services/cli-exchange-token.service'

@Module({
  imports: [MikroOrmModule.forFeature([CliExchangeToken])],
  providers: [CliExchangeTokenService],
  exports: [CliExchangeTokenService],
})
export class CliExchangeTokenModule {}
