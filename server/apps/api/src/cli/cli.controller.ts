import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, Get, HttpCode, Inject, Logger, Post } from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER_TOKEN, UserContext, userFile } from '@shared'
import { UserOpsCtx } from '@shared/types'
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
    @Body(new JsonSchemaPipe(userFile.inputs.CLINodeSearchSchema))
    body: userFile.inputs.CLINodeSearchInput,
  ) {
    const { spaceId, folderId, arg, type } = body

    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    const res = await new userFile.CLINodeSearchOperation(opsCtx).execute({
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
