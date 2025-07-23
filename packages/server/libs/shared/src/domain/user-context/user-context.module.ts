import { Global, Module } from '@nestjs/common'
import { challengeBotUserContextProvider } from '@shared/domain/user-context/provider/challenge-bot-user-context.provider'
import { userContextProvider } from '@shared/domain/user-context/provider/user-context.provider'

@Global()
@Module({
  providers: [userContextProvider, challengeBotUserContextProvider],
  exports: [userContextProvider, challengeBotUserContextProvider],
})
export class UserContextModule {}
