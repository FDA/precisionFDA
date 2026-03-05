import { Body, Controller, Get, HttpCode, ParseArrayPipe, Post, UseGuards } from '@nestjs/common'
import { AcceptedLicense } from '@shared/domain/accepted-license/accepted-license.entity'
import { AcceptedLicenseService } from '@shared/domain/accepted-license/accepted-license.service'
import { Uid } from '@shared/domain/entity/domain/uid'
import { License } from '@shared/domain/license/license.entity'
import { LicenseService } from '@shared/domain/license/license.service'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/licenses')
export class LicenseController {
  constructor(
    private readonly licenseService: LicenseService,
    private readonly acceptedLicenseService: AcceptedLicenseService,
  ) {}

  @Get('/accepted')
  async listAcceptedLicences(): Promise<AcceptedLicense[]> {
    return this.acceptedLicenseService.acceptLicenseForUser()
  }

  @HttpCode(200)
  @Post('/files')
  async listLicencesForFiles(
    @Body('uids', new ParseArrayPipe({ items: String })) uids: Uid<'file'>[],
  ): Promise<License[]> {
    return this.licenseService.findLicensedItemsByNodeUids(uids)
  }
}
