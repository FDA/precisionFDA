import { database } from '@pfda/https-apps-shared'

export const makeOrmContextMdw: Api.Mdw = () => async (ctx, next) => {
  ctx.em = database.orm().em.fork()
  return next()
}
