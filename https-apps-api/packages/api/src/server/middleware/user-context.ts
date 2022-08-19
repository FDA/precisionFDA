import { errors, utils, ajv, entities } from '@pfda/https-apps-shared'

export const parseUserContextMdw = (ctx: Api.Ctx, next) => {
  // TODO(samuel) proper sanitization in case array is passed into query-string
  const id = ctx.request.query.id
  ctx.user = {
    id: id ? parseInt(id.toString(), 10) : null,
    accessToken: ctx.request.query.accessToken?.toString(),
    dxuser: ctx.request.query.dxuser?.toString(),
  }
  if (Number.isNaN(ctx.user.id)) {
    throw new errors.ValidationError('User id was NaN');
  }
  ctx.log.debug({ userId: ctx.user.id }, 'User context retrieved')
  return next()
}

/**
 * This middleware expects some user data in the query
 * of the request.
 */
export const makeValidateUserContextMdw = () => {
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
          input: utils.maskAccessTokenUserCtx(ctx.validatedQuery),
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
    return next()
  }
}

// ! This MDW should be used only after validating user ctx
export const validateSiteAdminMdw = async (ctx: Api.Ctx, next) => {
  const userFromDb = await ctx.em.findOneOrFail(entities.User, {
    id: ctx.user.id,
  });
  const isSiteAdmin = await userFromDb.isSiteAdmin();
  if (!isSiteAdmin) {
    throw new errors.UserInvalidPermissionsError(
      'User requires Site Admin permission to access this resource',
    )
  }
  return next()
}
