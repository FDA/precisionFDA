import { Module } from '@nestjs/common'
import { AuthModule } from '@shared/domain/auth/auth.module'
import { CliExchangeTokenModule } from '@shared/domain/cli-exchange-token/cli-exchange-token.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { CliExchangeFacade } from './cli-exchange.facade'

@Module({
  imports: [PlatformClientModule, AuthModule, CliExchangeTokenModule],
  providers: [CliExchangeFacade],
  exports: [CliExchangeFacade],
})
export class CliExchangeFacadeModule {}
