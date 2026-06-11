import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AcceptedLicense } from '@shared/domain/accepted-license/accepted-license.entity'
import { AcceptedLicenseService } from '@shared/domain/accepted-license/accepted-license.service'
import { Uid } from '@shared/domain/entity/domain/uid'
import { License } from '@shared/domain/license/license.entity'
import { LicenseService } from '@shared/domain/license/license.service'
import { AcceptLicenseFacade } from '../facade/license/accept-license.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { UpdateLicensesDto } from './model/update-licenses.dto'
import { UpdateLicenseDto } from './model/update-license.dto'

@ApiTags('Licenses')
@ApiCookieAuth()
@UseGuards(UserContextGuard)
@Controller('/licenses')
export class LicensesController {
  constructor(
    private readonly licenseService: LicenseService,
    private readonly acceptedLicenseService: AcceptedLicenseService,
    private readonly acceptLicenseFacade: AcceptLicenseFacade,
  ) {}

  @ApiOperation({ summary: 'List accepted licenses for the current user' })
  @ApiResponse({ status: 200, description: 'List of accepted licenses' })
  @ApiResponse({ status: 401, description: 'Unauthorized – missing or invalid session' })
  @Get('/accepted')
  async listAcceptedLicences(): Promise<AcceptedLicense[]> {
    return this.acceptedLicenseService.acceptLicenseForUser()
  }

  @ApiOperation({ summary: 'List licenses associated with the given file UIDs' })
  @ApiResponse({ status: 200, description: 'List of licenses for the specified files' })
  @ApiResponse({ status: 401, description: 'Unauthorized – missing or invalid session' })
  @HttpCode(200)
  @Post('/files')
  async listLicencesForFiles(
    @Body('uids', new ParseArrayPipe({ items: String })) uids: Uid<'file'>[],
  ): Promise<License[]> {
    return this.licenseService.findLicensedItemsByNodeUids(uids)
  }

  @ApiOperation({
    summary: 'Update multiple licenses',
    description: 'Bulk update licenses for the current user. Currently supports accepting licenses.',
  })
  @ApiResponse({ status: 200, description: 'Licenses updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid body or unsupported operation' })
  @ApiResponse({ status: 401, description: 'Unauthorized – missing or invalid session' })
  @ApiResponse({ status: 404, description: 'Some licenses not found or not accessible' })
  @Patch()
  async updateLicenses(@Body() body: UpdateLicensesDto): Promise<{ acceptedLicenses: number[] }> {
    const result = await this.acceptLicenseFacade.acceptMany(body.ids)
    return { acceptedLicenses: result }
  }

  @ApiOperation({
    summary: 'Update a license',
    description: 'Update a license for the current user. Currently supports accepting a license.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Numeric ID of the license' })
  @ApiResponse({ status: 204, description: 'License updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid body or unsupported operation' })
  @ApiResponse({ status: 401, description: 'Unauthorized – missing or invalid session' })
  @ApiResponse({ status: 404, description: 'License not found or not accessible' })
  @HttpCode(204)
  @Patch('/:id')
  async updateLicense(
    @Param('id', ParseIntPipe) id: number,
    // Used for validation only (enforces `accepted: true`); extensible for future update operations
    @Body() _body: UpdateLicenseDto,
  ): Promise<void> {
    return this.acceptLicenseFacade.accept(id)
  }
}
