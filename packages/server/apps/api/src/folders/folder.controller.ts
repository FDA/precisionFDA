import { SqlEntityManager } from '@mikro-orm/mysql'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
import { RecreateFolderDTO } from './model/recreate-folder.dto'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { FolderService } from '@shared/domain/user-file/folder.service'
import { FetchChildrenDTO } from './model/fetch-children.dto'

@UseGuards(UserContextGuard)
@Controller('/folders')
export class FolderController {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly folderService: FolderService,
  ) {}

  @Get('/children')
  async getChildren(@Query() input: FetchChildrenDTO): Promise<Node[]> {
    return this.folderService.getFolderChildren(input)
  }

  @Patch('/:id/rename')
  async renameFolder(
    @Param('id', ParseIntPipe) id: number,
    @Body(new JsonSchemaPipe(renameFolderSchema))
    body: Omit<RenameFolderInput, 'id'>,
  ): Promise<Folder> {
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
  async recreateFolder(@Body() body: RecreateFolderDTO): Promise<void> {
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
