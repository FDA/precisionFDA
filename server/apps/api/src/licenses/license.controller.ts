import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, Get, HttpCode, Inject, Logger, Post, UseGuards } from '@nestjs/common'
import { acceptedLicense, DEPRECATED_SQL_ENTITY_MANAGER_TOKEN, license, UserContext } from '@shared'
import { UserOpsCtx } from '@shared/types'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { JsonSchemaPipe } from '../validation/pipes/json-schema.pipe'

@UseGuards(UserContextGuard)
@Controller('/licenses')
export class LicenseController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER_TOKEN) private readonly em: SqlEntityManager,
    private readonly log: Logger,
  ) {}

  @Get('/accepted')
  async listAcceptedLicences() {
    const [acceptedLicenses] = await this.em.findAndCount(acceptedLicense.AcceptedLicense, {
      user: this.user.id,
    })

    return acceptedLicenses
  }

  @HttpCode(200)
  @Post('/files')
  async listLicencesForFiles(
    @Body(new JsonSchemaPipe(license.inputs.filesSchema)) body: license.inputs.FilesInput,
  ) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.em,
    }

    return await new license.LicensesForFilesOperation(opsCtx).execute({ ...body })
  }
}
