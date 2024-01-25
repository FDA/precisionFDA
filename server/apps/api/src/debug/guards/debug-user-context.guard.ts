import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { UserContextGuard } from '../../user-context/guard/user-context.guard'

@Injectable()
export class DebugUserContextGuard implements CanActivate {
  constructor(private readonly userContextGuard: UserContextGuard) {}

  canActivate(context: ExecutionContext) {
    if (config.devFlags.middleware.skipUserMiddlewareForDebugRoutes) {
      return true
    }

    return this.userContextGuard.canActivate(context)
  }
}
