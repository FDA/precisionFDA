import { errors, utils, ajv } from '@pfda/https-apps-shared'

/**
 * This middleware expects some user data in the query
 * of the request.
 */
export const makeUserContextMdw = () => {
  // validate the schema from ctx.request.query
  // store to the ctx
  const validatorFn = ajv.compile(utils.schemas.userContextSchema)

  return (ctx: Api.Ctx, next) => {
    const isValid = validatorFn(ctx.request.query)
    ctx.validatedQuery = { ...ctx.request.query }
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
      id: ctx.validatedQuery.id,
      accessToken: ctx.validatedQuery.accessToken,
      dxuser: ctx.validatedQuery.dxuser,
    }
    ctx.log.debug({ userId: ctx.user.id }, 'User context retrieved')
    return next()
  }
}
