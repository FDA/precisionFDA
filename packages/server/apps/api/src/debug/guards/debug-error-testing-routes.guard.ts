import { CanActivate, Injectable } from '@nestjs/common'
import { config } from '@shared/config'

// Debugging exception capturing and memory
@Injectable()
export class DebugErrorTestingRoutesGuard implements CanActivate {
  canActivate() {
    return config.api.allowErrorTestingRoutes
  }
}
