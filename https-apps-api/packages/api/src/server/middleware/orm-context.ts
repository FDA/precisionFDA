import { database } from '@pfda/https-apps-shared'

export const ormContextMdw = (ctx: Api.Ctx, next) => {
  // TODO(samuel) fix by declaration merging
  ctx.em = database.orm().em.fork() as any
  return next()
}
