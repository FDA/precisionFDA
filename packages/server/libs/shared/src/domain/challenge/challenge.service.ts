import { Reference } from '@mikro-orm/core'
import { FilterQuery, SqlEntityManager } from '@mikro-orm/mysql'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { CaptchaService } from '@shared/captcha/captcha.service'
import { config } from '@shared/config'
import { App } from '@shared/domain/app/app.entity'
import { ChallengeResource } from '@shared/domain/challenge/challenge-resource.entity'
import { ChallengeResourceRepository } from '@shared/domain/challenge/challenge-resource.repository'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { CHALLENGE_STATUS } from '@shared/domain/challenge/challenge.enum'
import { ChallengeRepository } from '@shared/domain/challenge/challenge.repository'
import { AssignScoringAppDTO } from '@shared/domain/challenge/dto/assign-scoring-app.dto'
import {
  ChallengePaginationDto,
  FILTER_STATUS,
} from '@shared/domain/challenge/dto/challenge-pagination.dto'
import { ChallengeDTO } from '@shared/domain/challenge/dto/challenge.dto'
import { CreateChallengeDTO } from '@shared/domain/challenge/dto/create-challenge.dto'
import { ProposeChallengeDTO } from '@shared/domain/challenge/dto/propose-challenge.dto'
import { SubmissionDTO } from '@shared/domain/challenge/dto/submission.dto'
import {
  CHALLENGE_CONTENT_TYPE,
  UpdateChallengeContentDTO,
} from '@shared/domain/challenge/dto/update-challenge-content.dto'
import { UpdateChallengeDTO } from '@shared/domain/challenge/dto/update-challenge.dto'
import { Submission } from '@shared/domain/challenge/submission.entity'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { Uid } from '@shared/domain/entity/domain/uid'
import { ChallengeFollow } from '@shared/domain/follow/challenge-follow.entity'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { User, USER_STATE } from '@shared/domain/user/user.entity'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { NotFoundError, ValidationError } from '@shared/errors'
import { Searchable } from '@shared/interface/searchable'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { CHALLENGE_BOT_PLATFORM_CLIENT } from '@shared/platform-client/providers/platform-client.provider'
import { TimeUtils } from '@shared/utils/time.utils'

@Injectable()
export class ChallengeService implements Searchable<Challenge> {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    @Inject(CHALLENGE_BOT_PLATFORM_CLIENT)
    private readonly challengeBotPlatformClient: PlatformClient,
    private readonly platformClient: PlatformClient,
    private readonly notificationService: NotificationService,
    private readonly challengeRepo: ChallengeRepository,
    private readonly challengeResourceRepo: ChallengeResourceRepository,
    private readonly captchaService: CaptchaService,
  ) {}

  async createChallenge(dto: CreateChallengeDTO, spaceId: number): Promise<Challenge> {
    this.logger.log(`Creating new challenge: ${dto.name}`)

    return this.em.transactional(async (em) => {
      const challenge = dto.buildEntity()

      const appOwner = await em.findOne(User, {
        id: dto.appOwnerId,
        userState: USER_STATE.ENABLED,
      })
      if (!appOwner) {
        throw new NotFoundError('Scoring App user not found or is not active!')
      }

      challenge.spaceId = spaceId
      challenge.appOwner = Reference.create(appOwner)
      await em.persistAndFlush(challenge)
      // Set the specifiedOrder after the challenge is persisted
      challenge.specifiedOrder = challenge.id

      return challenge
    })
  }

  async updateChallenge(id: number, body: UpdateChallengeDTO): Promise<Challenge> {
    const challenge = await this.challengeRepo.findOneOrFail(id)

    if (
      ![CHALLENGE_STATUS.SETUP, CHALLENGE_STATUS.PRE_REGISTRATION].includes(body.status) &&
      challenge.appId == null
    ) {
      throw new ValidationError('Scoring app must be assigned to the challenge!')
    }

    if (challenge.startAt !== body.startAt || challenge.endAt !== body.endAt) {
      if (body.startAt >= body.endAt) {
        throw new ValidationError('Start date cannot be after end date!')
      }
    }

    // challenge is about to be updated to OPEN state
    if (body.status === CHALLENGE_STATUS.OPEN && challenge.status !== CHALLENGE_STATUS.OPEN) {
      if (challenge.startAt > new Date() || challenge.endAt < new Date()) {
        throw new ValidationError('Challenge cannot be opened before start date or after end date!')
      }
    }

    if (body.appOwnerId !== challenge.appOwner.id) {
      const appOwner = await this.em.findOne(User, {
        id: body.appOwnerId,
        userState: USER_STATE.ENABLED,
      })
      if (!appOwner) {
        throw new NotFoundError('Scoring App user not found or is not active!')
      }
      challenge.appOwner = Reference.create(appOwner)
    }

    challenge.name = body.name
    challenge.description = body.description
    challenge.startAt = body.startAt
    challenge.endAt = body.endAt
    challenge.status = body.status
    challenge.preRegistrationUrl = body.preRegistrationUrl ?? ''

    await this.em.persistAndFlush(challenge)
    return challenge
  }

  /**
   * Updates the visible text content of the challenge based on provided content type.
   * @param id challenge ID
   * @param body new content to replace the old one.
   */
  async updateContent(id: number, body: UpdateChallengeContentDTO): Promise<void> {
    const challenge = await this.challengeRepo.findOne({ id })

    if (!challenge) {
      throw new NotFoundError('Challenge does not exist!')
    }

    switch (body.type) {
      case CHALLENGE_CONTENT_TYPE.INFO:
        challenge.infoEditorState = body.editorState
        challenge.infoContent = body.content
        break
      case CHALLENGE_CONTENT_TYPE.RESULTS:
        challenge.resultsEditorState = body.editorState
        challenge.resultsContent = body.content
        break
      case CHALLENGE_CONTENT_TYPE.PRE_REGISTRATION:
        challenge.preRegistrationEditorState = body.editorState
        challenge.preRegistrationContent = body.content
        break
    }
    await this.em.flush()
  }

  async getChallenge(id: number): Promise<ChallengeDTO> {
    const challenge = await this.challengeRepo.findAccessibleOne({ id })
    if (!challenge) {
      throw new NotFoundError('Challenge not found!')
    }

    const user = await this.em.findOne(User, { id: this.user.id })

    let appUid = null
    if (challenge.appId) {
      const app = await this.em.findOne(
        App,
        {
          id: challenge.appId,
        },
        { fields: ['uid'] },
      )
      appUid = app.uid
    }

    if (!user) {
      return ChallengeDTO.mapToDTO(challenge, appUid, false, false, false)
    }

    const canEdit = await user.isSiteOrChallengeAdmin()

    const isSpaceMember =
      (await this.em.count(SpaceMembership, {
        user: { id: this.user.id },
        spaces: { id: challenge.spaceId },
        active: true,
      })) === 1

    const follows =
      (await this.em.count(ChallengeFollow, {
        followableId: challenge.id,
        followerId: this.user.id,
        followerType: 'User',
      })) === 1

    return ChallengeDTO.mapToDTO(challenge, appUid, follows, isSpaceMember, canEdit)
  }

  async getChallengeBotUser(): Promise<User> {
    const bot = await this.em.findOne(User, { dxuser: config.platform.challengeBotUser })
    if (!bot) {
      throw new NotFoundError('Challenge bot user not found!')
    }

    return bot
  }

  async createChallengeResource(
    challengeId: number,
    userFileId: number,
  ): Promise<ChallengeResource> {
    const challengeResource = new ChallengeResource(this.user.id, challengeId, userFileId)

    await this.em.persistAndFlush(challengeResource)

    return challengeResource
  }

  /**
   * Updates the card image url for a data portal
   * @param fileUid
   */
  async updateCardImageUrl(fileUid: Uid<'file'>): Promise<void> {
    this.logger.log(`Updating card image url for fileUid ${fileUid}`)
    const challenges = await this.challengeRepo.findChallengesByCardImageFileUid(fileUid)

    if (challenges.length === 0) {
      throw new NotFoundError(`Challenge for fileUid ${fileUid} was not found`)
    }
    const challenge = challenges[0]
    const cardImage = challenge.cardImage.getEntity()

    const link = await this.challengeBotPlatformClient.fileDownloadLink({
      fileDxid: cardImage.dxid,
      filename: cardImage.name,
      project: cardImage.project,
      duration: 9999999999,
    })

    challenge.cardImageUrl = link.url

    await this.em.flush()
    this.logger.log(`Card image url for fileUid ${fileUid} updated`)
    try {
      const userId = this.user.id
      const sessionId = this.user.sessionId
      await this.notificationService.createNotification({
        message: `Card image url for ${challenge.name} has been updated`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.CHALLENGE_CARD_IMAGE_URL_UPDATED,
        userId,
        sessionId,
      })
    } catch (error) {
      this.logger.error(`Error creating notification ${error}`)
    }
  }

  /**
   * Updates the resource url for Challenge resource.
   */
  async updateResourceUrl(fileUid: string): Promise<void> {
    this.logger.log(`Updating resource url for fileUid ${fileUid}`)
    const challengeResources =
      await this.challengeResourceRepo.findChallengeResourcesByFileUid(fileUid)

    if (challengeResources.length === 0) {
      throw new NotFoundError(`Challenge resource for fileUid ${fileUid} was not found`)
    }
    const challengeResource = challengeResources[0]
    const userFile = challengeResource.userFile.getEntity()

    const link = await this.challengeBotPlatformClient.fileDownloadLink({
      fileDxid: userFile.dxid,
      filename: userFile.name,
      project: userFile.project,
      duration: 9999999999,
    })

    challengeResource.url = link.url

    await this.em.flush()
    this.logger.log(`Resource url for fileUid ${fileUid} updated`)

    try {
      const userId = this.user.id
      const sessionId = this.user.sessionId
      await this.notificationService.createNotification({
        message: `Resource url for ${challengeResource.name} has been updated`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.CHALLENGE_RESOURCE_URL_UPDATED,
        userId,
        sessionId,
      })
    } catch (error) {
      this.logger.error(`Error creating notification ${error}`)
    }
  }

  /**
   * WIP
   * @param body
   */
  async proposeChallenge(body: ProposeChallengeDTO): Promise<void> {
    let canProposeChallenge = true

    if (!this.user.id || !this.user.accessToken || !this.user.sessionId) {
      canProposeChallenge = await this.captchaService.verifyCaptchaAssessment(
        body.captchaValue,
        'propose',
      )
    }

    if (canProposeChallenge) {
      // SEND CHALLENGE PROPOSE EMAIL WHEN TEMPLATE READY FOR NODE
    } else {
      throw new ValidationError('Not permitted to propose a challenge!')
    }
  }

  async assignApp(id: number, body: AssignScoringAppDTO): Promise<void> {
    const challenge = await this.challengeRepo.findOne({ id })
    const app = await this.em.findOne(App, { id: body.appId, user: { id: this.user.id } })

    if (!challenge) {
      throw new NotFoundError('Challenge was not found!')
    }

    if (!app) {
      throw new NotFoundError('App was not found or cannot be accessed!')
    }

    if (challenge.appOwner.id !== this.user.id) {
      throw new ValidationError('You are not allowed to assign scoring app to the challenge!')
    }

    if (
      [
        CHALLENGE_STATUS.OPEN,
        CHALLENGE_STATUS.ARCHIVED,
        CHALLENGE_STATUS.RESULT_ANNOUNCED,
      ].includes(challenge.status)
    ) {
      throw new ValidationError('Cannot assign scoring app to challenge with this status!')
    }

    if (challenge.appId === app.id) {
      throw new ValidationError('This scoring app is already assigned to this challenge!')
    }

    // add challengeBot developer to the app on platform
    const challengeBot = await this.getChallengeBotUser()

    await this.platformClient.appAddDevelopers({
      appId: app.dxid,
      developers: [challengeBot.dxid],
    })

    challenge.appId = app.id
    await this.em.flush()
  }

  async getOwnEntries(id: number): Promise<SubmissionDTO[]> {
    const challenge = await this.challengeRepo.findOne({ id })
    if (!challenge) {
      throw new NotFoundError('Challenge not found!')
    }

    const mySubmissions = await this.em.find(
      Submission,
      {
        challenge: challenge.id,
        user: this.user.id,
      },
      { populate: ['user', 'job', 'job.inputFiles'] },
    )

    return mySubmissions.map((submission) => {
      return SubmissionDTO.mapToDTO(submission)
    })
  }

  async getSubmissions(id: number): Promise<SubmissionDTO[]> {
    const challenge = await this.challengeRepo.findOne({ id })
    if (!challenge) {
      throw new NotFoundError('Challenge not found!')
    }

    const visibleSubmissions = await this.em.find(
      Submission,
      {
        challenge: challenge.id,
        job: {
          state: JOB_STATE.DONE,
        },
      },
      { populate: ['user', 'job', 'job.inputFiles'] },
    )

    return visibleSubmissions.map((submission) => {
      return SubmissionDTO.mapToDTO(submission)
    })
  }

  async listChallenges(pagination: ChallengePaginationDto): Promise<PaginatedResult<ChallengeDTO>> {
    const where: FilterQuery<Challenge> = {}
    const { year, status } = pagination.filter ?? {}

    if (year) {
      const [startOfYear, endOfYear] = TimeUtils.getTimeRangeForYear(year)
      where.startAt = { $gte: startOfYear, $lte: endOfYear }
    }
    switch (status) {
      case FILTER_STATUS.CURRENT:
        where.startAt = { $lte: new Date() }
        where.endAt = { $gte: new Date() }
        break
      case FILTER_STATUS.UPCOMING:
        where.startAt = { $gte: new Date() }
        break
      case FILTER_STATUS.ENDED:
        where.endAt = { $lte: new Date() }
        break
      default:
        break
    }

    const response = await this.challengeRepo.paginateAccessible(pagination, where)
    const challenges = response.data.map((challenge) => ChallengeDTO.mapToDTO(challenge))
    return { ...response, data: challenges }
  }

  async search(query: string): Promise<Challenge[]> {
    if (!query) {
      return []
    }

    return [
      ...(await this.challengeRepo.searchPreRegistrationByNameAndDescriptionAndContents(query)),
      ...(await this.challengeRepo.searchOpenPausedArchivedByNameAndDescriptionAndContents(query)),
      ...(await this.challengeRepo.searchResultAnnouncedByNameAndDescriptionAndContents(query)),
    ]
  }
}
