import { DefaultState } from 'koa'
import Router from 'koa-router'
import { userFile, utils } from '@pfda/https-apps-shared'
import { RenameFolderInput } from '@pfda/https-apps-shared/src/domain/user-file/user-file.input'
import { makeSchemaValidationMdw } from '../server/middleware/validation'
import { pickOpsCtx } from '../utils/pick-ops-ctx'
import { defaultMiddlewares } from '../server/middleware'

const router = new Router<DefaultState, Api.Ctx>()

router.use(defaultMiddlewares)

router.patch(
  '/:id/rename',
  makeSchemaValidationMdw({
    params: utils.schemas.idInputSchema,
    body: userFile.inputs.renameFolderSchema,
  }),
  async ctx => {
    const { newName } = ctx.request.body as Omit<RenameFolderInput, 'id'>

    const updatedFolder = await new userFile.FolderRenameOperation(pickOpsCtx(ctx)).execute({
      newName,
      id: ctx.params.id as any,
    })
    ctx.body = updatedFolder
  },
)

router.delete(
  '/:id',
  makeSchemaValidationMdw({ params: utils.schemas.idInputSchema }),
  async ctx => {
    const removedFoldersCnt = await new userFile.FolderRemoveRecursiveOperation(pickOpsCtx(ctx)).execute({
      id: ctx.params.id as any,
    })
    ctx.status = 200
    ctx.body = removedFoldersCnt
  },
)

router.post('/recreate', async ctx => {
  const { userId, projectId } = ctx.request.body as { userId: string, projectId: string }
  await new userFile.FolderRecreateOperation(pickOpsCtx(ctx)).execute({
    userId,
    projectId
  })
  ctx.status = 204
})

export { router }
