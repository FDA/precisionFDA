import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { CliFileDownloadResponse } from '@shared/domain/cli/dto/cli-file-download.dto'
import { Uid } from '@shared/domain/entity/domain/uid'
import { UserFileDownloadFacade } from '../facade/user-file/user-file-download.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { UidValidationPipe } from '../validation/pipes/uid.pipe'

// SPECIAL ROUTES INTENDED FOR CLI USAGE ONLY. CONTAINS CLI SPECIFIC LOGIC & SPECIAL RESPONSE OBJECTS.
@Controller('/cli/files')
export class CliFilesController {
  constructor(private readonly userFileDownloadFacade: UserFileDownloadFacade) {}

  @UseGuards(UserContextGuard)
  @Get('/:uid/download')
  async getFileDownloadLink(
    @Param('uid', new UidValidationPipe({ entityType: 'file' })) uid: Uid<'file'>,
  ): Promise<CliFileDownloadResponse> {
    const { url: fileUrl, size: fileSize } = await this.userFileDownloadFacade.getDownloadLink(uid, {})
    return {
      fileUrl,
      fileSize,
    }
  }
}
