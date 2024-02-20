import { Global, Module } from '@nestjs/common'
import { userContextProvider } from '@shared/domain/user-context/provider/user-context.provider'

@Global()
@Module({
  providers: [userContextProvider],
  exports: [userContextProvider],
})
export class UserContextModule {}
