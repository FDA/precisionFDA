import { database } from '@pfda/https-apps-shared'

// we dont need to use the middeleware, follow graphql example from the docs
// not sure why this is undefined, read the related github issues properly
export const makeOrmContextMdw: Api.Mdw = () => async (ctx, next) => {
  ctx.em = database.orm().em.fork()
  return next()
}
