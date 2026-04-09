import { Injectable } from '@nestjs/common'
import { CliFileDownloadResponse } from '@shared/domain/cli/dto/cli-file-download.dto'
import { Uid } from '@shared/domain/entity/domain/uid'
import { NodeService } from '@shared/domain/user-file/node.service'
import { NotFoundError } from '@shared/errors'
import { UserFileDownloadFacade } from '../user-file/user-file-download.facade'

@Injectable()
export class CliFileDownloadFacade {
  constructor(
    private readonly nodeService: NodeService,
    private readonly userFileDownloadFacade: UserFileDownloadFacade,
  ) {}

  async getDownloadLink(uid: Uid<'file'>): Promise<CliFileDownloadResponse> {
    const file = await this.nodeService.getUserFileOrAsset(uid)
    if (!file) {
      throw new NotFoundError('File not found or not accessible')
    }

    const fileUrl = await this.userFileDownloadFacade.getDownloadLink(uid, {})

    return {
      fileUrl,
      fileSize: file.fileSize,
    }
  }
}
