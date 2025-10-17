import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { PlatformClient } from '@shared/platform-client'
import { Uid } from '@shared/domain/entity/domain/uid'
import { GetUploadURLResponse } from '@shared/platform-client/platform-client.responses'
import { CHALLENGE_BOT_PLATFORM_CLIENT } from '@shared/platform-client/providers/platform-client.provider'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { UserFile } from '@shared/domain/user-file/user-file.entity'

@Injectable()
export class UrlFetchService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly nodeRepo: NodeRepository,
    private readonly userClient: PlatformClient,
    @Inject(CHALLENGE_BOT_PLATFORM_CLIENT)
    private readonly challengeBotPlatformClient: PlatformClient,
  ) {}

  async getUploadUrl(
    fileUid: Uid<'file'>,
    index: number,
    md5: string,
    size: number,
  ): Promise<GetUploadURLResponse> {
    this.logger.log(
      `Generating upload URL for fileUid: ${fileUid}, index: ${index}, md5: ${md5}, size: ${size}`,
    )
    const targetClient = await this.getTargetClient(fileUid)

    const fileDxid = fileUid.replace(/-(\d+)$/, '')
    const uploadUrlResponse = await targetClient.getFileUploadUrl({
      dxid: fileDxid,
      index,
      md5,
      size,
    })
    this.logger.log(
      `Generated upload URL for fileDxId: ${fileDxid}` + JSON.stringify(uploadUrlResponse),
    )
    return uploadUrlResponse
  }

  private async getTargetClient(fileUid: Uid<'file'>): Promise<PlatformClient> {
    const node = await this.nodeRepo.findOneOrFail({ uid: fileUid }, { populate: ['user'] })
    if (node.stiType === FILE_STI_TYPE.USERFILE) {
      const userFile = node as unknown as UserFile
      await userFile.challengeResources.load()
      if (userFile.isCreatedByChallengeBot()) {
        this.logger.log(`Using challenge bot platform client for fileUid: ${fileUid}`)
        return this.challengeBotPlatformClient
      }
    }
    this.logger.log(`Using user platform client for fileUid: ${fileUid}`)
    return this.userClient
  }
}
