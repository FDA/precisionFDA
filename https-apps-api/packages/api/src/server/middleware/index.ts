import { makeValidateUserContextMdw } from './user-context'

export { makeLogRequestMdw } from './log-request'

export { makeErrorHandlerMdw } from './error-handler'

export { makeOrmContextMdw } from './orm-context'

export { makeValidationMdw } from './validation'

export { makeParseUserContextMdw } from './user-context';

// NOTE in case of further additions, use koa-compose
export const defaultMiddlewares = makeValidateUserContextMdw();
