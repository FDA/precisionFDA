import { errors } from '@pfda/https-apps-shared';
import * as z from 'zod';

export function validateBodyMiddleware(schema: z.Schema) {
  return async (ctx: Api.Ctx, next: any) => {
    try {
      const body = schema.parse(ctx.request.body);
      ctx.request.body = body;
    } catch (error) {
      throw new errors.ValidationError('', {
        code: errors.ErrorCodes.VALIDATION,
        statusCode: 400,
        validationErrors: error,
      })
    }
    return next()
  }
}
export function validateParamsMiddleware(schema: z.Schema) {
  return async (ctx: Api.Ctx, next: any) => {
    const url = ctx.request.url
    const searchParams = new URLSearchParams(url.substring(url.indexOf('?')));

    searchParams.delete('action')
    searchParams.delete('controller')
    searchParams.delete('accessToken')
    searchParams.delete('dxuser')
    searchParams.delete('id')

    const params = Object.fromEntries(searchParams)

    try {
      const parsedParmas = await schema.parseAsync(params);
      ctx.validatedParams = parsedParmas;
    } catch (error) {
      ctx.log.warn(
        {
          url: ctx.request.url,
          input: params,
          errors: error.format(),
        },
        'Validation by schema failed',
      )
      throw new errors.ValidationError('', {
        code: errors.ErrorCodes.VALIDATION,
        statusCode: 400,
        validationErrors: error.format(),
      })
    }

    return next()
  }
}
