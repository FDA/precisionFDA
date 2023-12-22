import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, Inject, Logger, Param, Patch, UseGuards } from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER_TOKEN, UserContext, userFile } from '@shared'
import { CloseFileInput } from '@shared/domain/user-file/user-file.input'
import { UserOpsCtx } from '@shared/types'
import { JSONSchema7 } from 'json-schema'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'

// TODO temporarily
const fileCloseSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    forceWaitForClose: { type: 'string' },
  },
  required: ['id'],
  additionalProperties: false,
}

@UseGuards(UserContextGuard)
@Controller('/files')
export class FilesController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER_TOKEN) private readonly em: SqlEntityManager,
    private readonly log: Logger,
  ) {}

  // Close an uploaded file
  //   Note that the file uid (not dxid) is used here, e.g.
  //   /files/file-xxxx-1/close
  //
  @Patch('/:id/close')
  async closeFile(
    @Param(new JsonSchemaPipe(fileCloseSchema)) params: unknown,
    @Body() body: CloseFileInput,
  ) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    return await new userFile.FileCloseOperation(opsCtx).execute(body)
  }
}
