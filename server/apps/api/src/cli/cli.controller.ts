import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, Get, HttpCode, Inject, Logger, Post } from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER_TOKEN } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
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
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER_TOKEN) private readonly em: SqlEntityManager,
    private readonly log: Logger,
  ) {}

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
    // we will need some sort of mappers or serializers to match ruby output.
  }

  @Get('/version/latest')
  getLatestVersion() {
    return { version: '2.5.0' }
  }
}
