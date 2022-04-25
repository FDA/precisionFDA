import { DefaultState } from 'koa'
import Router from 'koa-router'
import { userFile, utils } from '@pfda/https-apps-shared'
import { makeValidationMdw } from '../server/middleware/validation'
import { pickOpsCtx } from '../utils'
import { defaultMiddlewares } from '../server/middleware'

const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)

router.patch(
  '/:id/rename',
  makeValidationMdw({
    params: utils.schemas.idInputSchema,
    body: userFile.inputs.renameFolderSchema,
  }),
  async ctx => {
    const updatedFolder = await new userFile.FolderRenameOperation(pickOpsCtx(ctx)).execute({
      newName: ctx.request.body.newName,
      id: ctx.params.id as any,
    })
    ctx.body = updatedFolder
  },
)

router.delete('/:id', makeValidationMdw({ params: utils.schemas.idInputSchema }), async ctx => {
  const removedFoldersCnt = await new userFile.FolderDeleteOperation(pickOpsCtx(ctx)).execute({
    id: ctx.params.id as any,
  })
  ctx.status = 200
  ctx.body = removedFoldersCnt
})

router.post('/recreate', async ctx => {
  await new userFile.FolderRecreateOperation(pickOpsCtx(ctx)).execute({
    userId: ctx.request.body.userId,
    projectId: ctx.request.body.projectId,
  })
  ctx.status = 204
})

export { router }
