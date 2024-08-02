import { SqlEntityManager } from '@mikro-orm/mysql'
import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { FolderRecreateOperation } from '@shared/domain/user-file/ops/folder-recreate'
import { FolderRenameOperation } from '@shared/domain/user-file/ops/folder-rename'
import { RenameFolderInput, renameFolderSchema } from '@shared/domain/user-file/user-file.input'
import { UserOpsCtx } from '@shared/types'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'

@UseGuards(UserContextGuard)
@Controller('/folders')
export class FolderController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly logger: Logger,
  ) {}

  @Patch('/:id/rename')
  async renameFolder(
    @Param('id', ParseIntPipe) id: number,
    @Body(new JsonSchemaPipe(renameFolderSchema))
    body: Omit<RenameFolderInput, 'id'>,
  ) {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    return await new FolderRenameOperation(opsCtx).execute({
      newName: body.newName,
      id,
    })
  }

  @HttpCode(204)
  @Post('/recreate')
  async recreateFolder(@Body() body: { userId: string; projectId: string }) {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.em,
    }

    const { userId, projectId } = body

    await new FolderRecreateOperation(opsCtx).execute({
      userId,
      projectId,
    })
  }
}
