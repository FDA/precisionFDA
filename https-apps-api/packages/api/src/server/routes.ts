import Router from 'koa-router'
import { DefaultState } from 'koa'
// import { router as usersRouter } from '../users'
import { router as appsRouter } from '../apps'
import { router as jobsRouter } from '../jobs'
import { router as foldersRouter } from '../folders'

const router = new Router<DefaultState, Api.Ctx>()

// plug-in all the endpoints
// router.use('/users', usersRouter.routes(), usersRouter.allowedMethods())
router.use('/apps', appsRouter.routes(), appsRouter.allowedMethods())
router.use('/jobs', jobsRouter.routes(), jobsRouter.allowedMethods())
router.use('/folders', foldersRouter.routes(), foldersRouter.allowedMethods())

export { router }
