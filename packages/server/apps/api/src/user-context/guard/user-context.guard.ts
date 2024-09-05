import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { ErrorCodes, ValidationError } from '@shared/errors'
import { schemas } from '@shared/utils/base-schemas'
import { maskAccessTokenUserCtx } from '@shared/utils/logging'
import { ajv } from '@shared/utils/validator'

@Injectable()
export class UserContextGuard implements CanActivate {
  constructor(
    private readonly logger: Logger,
    private readonly user: UserContext,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()

    const validatorFn = ajv.compile(schemas.userContextSchema)

    if (validatorFn(request.headers)) {
      return true
    }

    this.logger.warn(
      {
        url: request.url,
        input: maskAccessTokenUserCtx(this.user),
        errors: validatorFn.errors,
      },
      'User context - validation failed',
    )
    throw new ValidationError('User context (request headers) invalid', {
      code: ErrorCodes.USER_CONTEXT_QUERY_INVALID,
      statusCode: 400,
      validationErrors: validatorFn.errors,
    })
  }
}
