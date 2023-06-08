import { config, ENUMS, errors } from '@pfda/https-apps-shared'

const formatKnownError = (err: errors.BaseError) => {
  const payload: Record<string, any> = {
    error: {
      message: err.message,
      ...err.props,
    },
  }
  if (config.env !== ENUMS.ENVS.PRODUCTION) {
    payload.stack = err.stack
  }
  return payload
}

const formatUnknownError = (err: Error) => {
  const payload: Record<string, any> = {
    error: {
      message: err.message,
      name: err.name,
      code: 'GENERIC',
    },
  }
  if (config.env !== ENUMS.ENVS.PRODUCTION) {
    payload.stack = err.stack
  }
  return payload
}

export const errorHandlerMdw = async (ctx: Api.Ctx, next: any) => {
  try {
    // eslint-disable-next-line @typescript-eslint/return-await
    return await next()
  } catch (err: any) {
    if (err instanceof errors.BaseError) {
      // This repeats error logging in Operation failed
      // ctx.log.error({ error: err }, 'Error: Request error handler - known error')
      ctx.status = err.props.statusCode || 500
      ctx.body = formatKnownError(err)
    } else {
      // This repeats error logging in Operation failed
      // ctx.log.error({ error: err }, 'Error: Request error handler - unknown error')
      ctx.status = 500
      ctx.body = formatUnknownError(err)
    }
  }
}
