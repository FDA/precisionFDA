import Router from 'koa-router'
import { DefaultState } from 'koa'
import { router as appsRouter } from '../apps'
import { router as jobsRouter } from '../jobs'
import { router as foldersRouter } from '../folders'
import { router as emailsRouter } from '../emails'
import { router as dbClustersRouter } from '../dbclusters'
import { router as adminRouter } from '../admin'
import { router as debugRouter } from '../debug'

const router = new Router<DefaultState, Api.Ctx>()

// plug-in all the endpoints
router.use('/apps', appsRouter.routes(), appsRouter.allowedMethods())
router.use('/jobs', jobsRouter.routes(), jobsRouter.allowedMethods())
router.use('/folders', foldersRouter.routes(), foldersRouter.allowedMethods())
router.use('/emails', emailsRouter.routes(), emailsRouter.allowedMethods())
router.use('/dbclusters', dbClustersRouter.routes(), dbClustersRouter.allowedMethods())

// TODO: Add an admin authentication middleware, but not urgent
router.use('/admin', adminRouter.routes(), adminRouter.allowedMethods())
router.use('/debug', debugRouter.routes(), debugRouter.allowedMethods())

export { router }
