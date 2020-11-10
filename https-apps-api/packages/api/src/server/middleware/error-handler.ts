import { config, ENUMS, errors } from '@pfda/https-apps-shared'

const formatKnownError = (err: errors.BaseError) => {
  const payload: Record<string, any> = {
    message: err.message,
    name: err.name,
    code: err.props.code,
    props: { ...err.props },
  }
  if (config.env !== ENUMS.ENVS.PRODUCTION) {
    payload.stack = err.stack
  }
  return payload
}

const formatUnknownError = (err: Error) => {
  const payload: Record<string, any> = {
    message: err.message,
    name: err.name,
    code: 'GENERIC',
  }
  if (config.env !== ENUMS.ENVS.PRODUCTION) {
    payload.stack = err.stack
  }
  return payload
}

export const makeErrorHandlerMdw: Api.Mdw = () => async (ctx, next) => {
  try {
    // eslint-disable-next-line @typescript-eslint/return-await
    return await next()
  } catch (err) {
    if (err instanceof errors.BaseError) {
      ctx.log.warn({ err }, 'request error handler - known error')
      ctx.status = err.props.statusCode || 500
      ctx.body = formatKnownError(err)
    } else {
      ctx.log.error({ err }, 'request error handler - unknown error')
      ctx.status = 500
      ctx.body = formatUnknownError(err)
    }
  }
}
