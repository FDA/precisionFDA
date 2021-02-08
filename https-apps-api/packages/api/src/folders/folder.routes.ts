import { DefaultState } from 'koa'
import Router from 'koa-router'
import { userFile, utils } from '@pfda/https-apps-shared'
import { makeValidationMdw } from '../server/middleware/validation'
import { pickOpsCtx } from '../utils'

const router = new Router<DefaultState, Api.Ctx>()

router.patch(
  '/:id/rename',
  makeValidationMdw({
    params: utils.schemas.idInputSchema,
    body: userFile.inputs.renameFolderSchema,
  }),
  async ctx => {
    const updatedFolder = await new userFile.FolderRenameOperation(pickOpsCtx(ctx)).execute({
      newName: ctx.request.body.newName,
      id: ctx.params.id,
    })
    ctx.body = updatedFolder
  },
)

router.delete('/:id', makeValidationMdw({ params: utils.schemas.idInputSchema }), async ctx => {
  await new userFile.FolderDeleteOperation(pickOpsCtx(ctx)).execute({
    id: ctx.params.id,
  })
  ctx.status = 204
})

export { router }
