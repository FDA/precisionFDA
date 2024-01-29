import { Global, Module } from '@nestjs/common'
import { userContextProvider } from './providers/user-context.provider'

@Global()
@Module({
  providers: [userContextProvider],
  exports: [userContextProvider],
})
export class UserContextModule {}
