import { makeValidateUserContextMdw } from './user-context'

// NOTE(samuel) in case of further additions, use koa-compose
export const defaultMiddlewares = makeValidateUserContextMdw()
