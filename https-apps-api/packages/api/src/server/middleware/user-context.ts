import { errors } from '@pfda/https-apps-shared'
import { ajv, schemas } from '../../utils'

/**
 * This middleware expects some user data in the query
 * of the request.
 */
export const makeUserContextMdw = () => {
  // validate the schema from ctx.request.query
  // store to the ctx
  const validatorFn = ajv.compile(schemas.userContextSchema)

  return (ctx: Api.Ctx, next) => {
    const isValid = validatorFn(ctx.request.query)
    if (!isValid) {
      ctx.log.warn(
        {
          url: ctx.request.url,
          // sanitize?
          input: ctx.request.query,
          errors: validatorFn.errors,
        },
        'User context - validation failed',
      )
      throw new errors.ValidationError('User context (request query) invalid', {
        code: errors.ErrorCodes.USER_CONTEXT_QUERY_INVALID,
        statusCode: 400,
        validationErrors: validatorFn.errors,
      })
    }
    ctx.user = {
      id: ctx.request.query.id,
      accessToken: ctx.request.query.accessToken,
      dxuser: ctx.request.query.dxuser,
    }
    ctx.log.debug({ userId: ctx.user.id }, 'User context retrieved')
    return next()
  }
}
