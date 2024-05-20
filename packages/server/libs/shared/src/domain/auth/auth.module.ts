import { Module } from '@nestjs/common'
import { authSessionOperationProvider } from '@shared/domain/auth/provider/auth-session-operation.provider'

@Module({
  providers: [authSessionOperationProvider],
  exports: [authSessionOperationProvider],
})
export class AuthModule {}
