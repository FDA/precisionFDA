import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { ajv, errors, UserContext, utils } from '@shared'

@Injectable()
export class UserContextGuard implements CanActivate {
  constructor(
    private readonly log: Logger,
    private readonly user: UserContext,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()

    const validatorFn = ajv.compile(utils.schemas.userContextSchema)

    if (validatorFn(request.headers)) {
      return true
    }

    this.log.warn(
      {
        url: request.url,
        input: utils.maskAccessTokenUserCtx(this.user),
        errors: validatorFn.errors,
      },
      'User context - validation failed',
    )
    throw new errors.ValidationError('User context (request headers) invalid', {
      code: errors.ErrorCodes.USER_CONTEXT_QUERY_INVALID,
      statusCode: 400,
      validationErrors: validatorFn.errors,
    })
  }
}
