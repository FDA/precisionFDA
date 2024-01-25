import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, Get, HttpCode, Inject, Logger, Post, UseGuards } from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { AcceptedLicense } from '@shared/domain/accepted-license/accepted-license.entity'
import { FilesInput, filesSchema } from '@shared/domain/license/license.input'
import { LicensesForFilesOperation } from '@shared/domain/license/ops/licenses-for-files'
import { UserOpsCtx } from '@shared/types'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'

@UseGuards(UserContextGuard)
@Controller('/licenses')
export class LicenseController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly log: Logger,
  ) {}

  @Get('/accepted')
  async listAcceptedLicences() {
    const [acceptedLicenses] = await this.em.findAndCount(AcceptedLicense, {
      user: this.user.id,
    })

    return acceptedLicenses
  }

  @HttpCode(200)
  @Post('/files')
  async listLicencesForFiles(
    @Body(new JsonSchemaPipe(filesSchema)) body: FilesInput,
  ) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    return await new LicensesForFilesOperation(opsCtx).execute({ ...body })
  }
}
