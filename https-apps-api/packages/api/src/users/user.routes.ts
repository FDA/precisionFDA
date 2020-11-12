// import { DefaultState } from 'koa'
// import Router from 'koa-router'
// import { FindUserOperation } from './ops/find'
// import { ListUsersOperation } from './ops/list'

// const router = new Router<DefaultState, Api.Ctx>()

// router.get('/', async ctx => {
//   const res = await new ListUsersOperation(ctx).run()
//   ctx.body = res
//   ctx.status = 200
// })

// router.get('/:id', async ctx => {
//   const res = await new FindUserOperation(ctx).run({ id: ctx.params.id })
//   ctx.body = res
//   ctx.status = 200
// })

// export { router }
