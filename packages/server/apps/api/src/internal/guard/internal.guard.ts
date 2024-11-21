import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { config } from '@shared/config'

/**
 * Guard that prevents access to internal endpoints in case the instance is not started as internal.
 */
@Injectable()
export class InternalRouteGuard implements CanActivate {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  canActivate(context: ExecutionContext): boolean {
    if (config.api.internalEndpointsEnabled) {
      return true
    }

    const applicationRef = this.httpAdapterHost.httpAdapter
    const req = context.switchToHttp().getRequest()
    const method = applicationRef.getRequestMethod(req)
    const url = applicationRef.getRequestUrl(req)

    throw new NotFoundException(`Cannot ${method} ${url}`)
  }
}
