import { database } from '@shared'

export const ormContextMdw = (ctx: Api.Ctx, next: any) => {
  // TODO(samuel) fix by declaration merging
  ctx.em = database.orm().em.fork() as any
  return next()
}
