import Router from 'koa-router'
import { DefaultState } from 'koa'
import { router as accountRouter } from '../account'
import { router as adminRouter } from '../admin'
import { router as appsRouter } from '../apps'
import { router as dbClustersRouter } from '../dbclusters'
import { router as debugRouter } from '../debug'
import { router as emailsRouter } from '../emails'
import { router as expertsRouter } from '../experts'
import { router as foldersRouter } from '../folders'
import { router as jobsRouter } from '../jobs'
import { router as siteSettingsRouter } from '../site-settings'
import { router as spacesRouter } from '../spaces'
import { router as usersRouter } from '../users'

const router = new Router<DefaultState, Api.Ctx>()

// plug-in all the endpoints
router.use('/account', accountRouter.routes(), accountRouter.allowedMethods())
router.use('/admin', adminRouter.routes(), adminRouter.allowedMethods())
router.use('/apps', appsRouter.routes(), appsRouter.allowedMethods())
router.use('/dbclusters', dbClustersRouter.routes(), dbClustersRouter.allowedMethods())
router.use('/debug', debugRouter.routes(), debugRouter.allowedMethods())
router.use('/emails', emailsRouter.routes(), emailsRouter.allowedMethods())
router.use('/experts', expertsRouter.routes(), expertsRouter.allowedMethods())
router.use('/folders', foldersRouter.routes(), foldersRouter.allowedMethods())
router.use('/jobs', jobsRouter.routes(), jobsRouter.allowedMethods())
router.use('/site-settings', siteSettingsRouter.routes(), siteSettingsRouter.allowedMethods())
router.use('/spaces', spacesRouter.routes(), spacesRouter.allowedMethods())
router.use('/users', usersRouter.routes(), usersRouter.allowedMethods())
// TODO: Add an admin authentication middleware, but not urgent

export { router }
