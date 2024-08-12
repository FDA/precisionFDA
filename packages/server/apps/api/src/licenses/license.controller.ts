import { SqlEntityManager } from '@mikro-orm/mysql'
import { Controller, Get, HttpCode, Inject, ParseArrayPipe, Query, UseGuards } from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { AcceptedLicense } from '@shared/domain/accepted-license/accepted-license.entity'
import { Uid } from '@shared/domain/entity/domain/uid'
import { LicenseService } from '@shared/domain/license/license.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/licenses')
export class LicenseController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly licenseService: LicenseService,
  ) {}

  @Get('/accepted')
  async listAcceptedLicences() {
    const [acceptedLicenses] = await this.em.findAndCount(AcceptedLicense, {
      user: this.user.id,
    })

    return acceptedLicenses
  }

  @HttpCode(200)
  @Get('/files')
  async listLicencesForFiles(
    @Query('uids', new ParseArrayPipe({ items: String })) uids: Uid<'file'>[],
  ) {
    return this.licenseService.findLicensedItemsByNodeUids(uids)
  }
}
