import { Inject, Injectable } from '@nestjs/common'
import { CHALLENGE_STATUS } from '@shared/domain/challenge/challenge.enum'
import { ChallengeService } from '@shared/domain/challenge/challenge.service'
import { CreateChallengeDTO } from '@shared/domain/challenge/dto/create-challenge.dto'
import { CreateChallengeResourceDTO } from '@shared/domain/challenge/dto/create-challenge-resource.dto'
import { UpdateChallengeDTO } from '@shared/domain/challenge/dto/update-challenge.dto'
import { EmailService } from '@shared/domain/email/email.service'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { CreateSpaceDTO } from '@shared/domain/space/dto/create-space.dto'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { NodeService } from '@shared/domain/user-file/node.service'
import { FILE_STATE_DX, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { STATIC_SCOPE } from '@shared/enums'
import { PlatformClient } from '@shared/platform-client'
import { CHALLENGE_BOT_PLATFORM_CLIENT } from '@shared/platform-client/providers/platform-client.provider'
import { EntityScopeUtils } from '@shared/utils/entity-scope.utils'

@Injectable()
export class ChallengeFacade {
  constructor(
    private readonly challengeService: ChallengeService,
    @Inject(CHALLENGE_BOT_PLATFORM_CLIENT)
    private readonly challengeBotPlatformClient: PlatformClient,
    private readonly nodeService: NodeService,
    private readonly spaceService: SpaceService,
    private readonly emailService: EmailService,
  ) {}

  async createChallenge(dto: CreateChallengeDTO): Promise<number> {
    let spaceId: number
    if (EntityScopeUtils.isSpaceScope(dto.scope)) {
      spaceId = EntityScopeUtils.getSpaceIdFromScope(dto.scope)
    } else {
      spaceId = await this.provideChallengeSpace(dto)
    }

    const newChallenge = await this.challengeService.createChallenge(dto, spaceId)

    if (newChallenge.status === CHALLENGE_STATUS.PRE_REGISTRATION) {
      await this.emailService.sendEmail({
        type: EMAIL_TYPES.challengePrereg,
        input: {
          challengeId: newChallenge.id,
          name: newChallenge.name,
          scope: newChallenge.scope,
        },
        // this is not used, refactor later.
        receiverUserIds: [],
      })
    }

    return newChallenge.id
  }

  async updateChallenge(challengeId: number, dto: UpdateChallengeDTO): Promise<void> {
    const challenge = await this.challengeService.getChallenge(challengeId)
    const sendPreRegEmail =
      dto.status === CHALLENGE_STATUS.PRE_REGISTRATION && challenge.status === CHALLENGE_STATUS.SETUP
    const sendOpenEmail = dto.status === CHALLENGE_STATUS.OPEN && challenge.status !== CHALLENGE_STATUS.OPEN

    // if the update fails it will throw an error and the emails will not be sent
    await this.challengeService.updateChallenge(challengeId, dto)

    if (sendPreRegEmail) {
      await this.emailService.sendEmail({
        type: EMAIL_TYPES.challengePrereg,
        input: {
          challengeId: challenge.id,
          name: challenge.name,
          scope: challenge.scope,
        },
        receiverUserIds: [],
      })
    }

    if (sendOpenEmail) {
      await this.emailService.sendEmail({
        type: EMAIL_TYPES.challengeOpened,
        input: {
          challengeId: challenge.id,
        },
        receiverUserIds: [],
      })
    }
  }

  private async provideChallengeSpace(body: CreateChallengeDTO): Promise<number> {
    const space = new CreateSpaceDTO()
    space.name = body.name
    space.forChallenge = true
    space.spaceType = SPACE_TYPE.GROUPS
    space.description = body.description
    space.hostLeadDxuser = body.hostLeadDxuser
    space.guestLeadDxuser = body.guestLeadDxuser
    return await this.spaceService.create(space)
  }

  /*
  Currently UNUSED - missing Frontend implementation
   */
  async createChallengeResource(
    challengeId: number,
    dto: CreateChallengeResourceDTO,
  ): Promise<{
    id: number
    fileUid: `file-${string}-${number}`
  }> {
    const challenge = await this.challengeService.getChallenge(challengeId)
    const challengeBot = await this.challengeService.getChallengeBotUser()

    const response = await this.challengeBotPlatformClient.fileCreate({
      name: dto.name,
      description: null,
      project: challengeBot.privateFilesProject,
    })
    const file = await this.nodeService.createFile({
      dxid: response.id,
      name: dto.name,
      description: dto.description,
      project: challengeBot.privateFilesProject,
      parentId: challengeBot.id,
      parentType: PARENT_TYPE.USER,
      userId: challengeBot.id,
      state: FILE_STATE_DX.OPEN,
      scope: STATIC_SCOPE.PRIVATE,
    })

    const resource = await this.challengeService.createChallengeResource(challenge.id, file.id)
    return { id: resource.id, fileUid: file.uid }
  }
}
