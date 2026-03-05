import { Module } from '@nestjs/common'
import { authSessionOperationProvider } from '@shared/domain/auth/provider/auth-session-operation.provider'
import { AuthService } from './services/auth.service'

@Module({
  providers: [authSessionOperationProvider, AuthService],
  exports: [authSessionOperationProvider, AuthService],
})
export class AuthModule {}
