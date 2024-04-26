import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, Get, HttpCode, Inject, Logger, Param, Post } from '@nestjs/common'
import {
  DEPRECATED_SQL_ENTITY_MANAGER,
} from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { CliService } from '@shared/domain/cli/service/cli.service'
import { CLINodeSearchOperation } from '@shared/domain/user-file/ops/cli-node-search'
import { CLINodeSearchInput, CLINodeSearchSchema } from '@shared/domain/user-file/user-file.input'
import { UserOpsCtx } from '@shared/types'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'

// SPECIAL ROUTES INTENDED FOR CLI USAGE ONLY. CONTAINS CLI SPECIFIC LOGIC & SPECIAL RESPONSE OBJECTS.
@Controller('/cli')
export class CliController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly log: Logger,
    private readonly cliService: CliService,
  ) {
  }

  // Finds all matching nodes and returns them.
  @HttpCode(200)
  @Post('/nodes')
  async findNodes(
    @Body(new JsonSchemaPipe(CLINodeSearchSchema))
      body: CLINodeSearchInput,
  ) {
    const { spaceId, folderId, arg, type } = body

    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    const res = await new CLINodeSearchOperation(opsCtx).execute({
      spaceId,
      folderId,
      arg,
      type,
    })

    return {
      files: res,
      folders: [],
    }
  }

  @Get('/version/latest')
  getLatestVersion() {
    return { version: '2.6.1' }
  }


  @Get('/:uid/describe')
  async describeEntity(@Param('uid') uid: string) {
    return this.cliService.describeEntity(uid)
  }


  @Get('/spaces/:id/members')
  async listMembers(@Param('id') spaceId: number) {
    return this.cliService.listSpaceMembers(spaceId)
  }

  @Get('/spaces/:id/discussions')
  async listDiscussions(@Param('id') spaceId: number) {
    return this.cliService.listSpaceDiscussions(spaceId)
  }

  @Get('/discussions/:discussionId/describe')
  async describeDiscussion(@Param('discussionId') discussionId: number) {
    return this.cliService.describeDiscussion(discussionId)
  }

}
