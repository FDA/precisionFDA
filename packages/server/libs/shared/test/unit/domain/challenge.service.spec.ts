import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { ChallengeService } from '@shared/domain/challenge/challenge.service'
import { User } from '@shared/domain/user/user.entity'
import { expect } from 'chai'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { NotificationInput } from '@shared/domain/notification/notification.input'
import { PlatformClient } from '@shared/platform-client'
import { create, db } from '../../../src/test'
import { Logger } from '@nestjs/common'
import { NotFoundError } from '@shared/errors'
import { stub } from 'sinon'
import { ChallengeRepository } from '@shared/domain/challenge/challenge.repository'
import { ChallengeResourceRepository } from '@shared/domain/challenge/challenge-resource.repository'

describe('ChallengeService', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let userCtx: UserCtx

  let challengeService: ChallengeService
  let notificationService: NotificationService
  const fileDownloadLinkStub = stub()
  let notificationParams: NotificationInput

  const LINK_URL = 'https://example.com'
  const CHALLENGE_NAME = 'challenge-name'
  const FILE_DXID = 'file-xxxx'
  const FILE_UID = `${FILE_DXID}-1`
  const FILE_NAME = 'fileName'
  const PROJECT = 'project'

  const findChallengesStub = stub()

  const challengeRepository = {
    findChallengesByCardImageFileUid: findChallengesStub,
  } as unknown as ChallengeRepository

  const findChallengeResourcesStub = stub()
  const challengeResourceRepository = {
    findChallengeResourcesByFileUid: findChallengeResourcesStub,
  } as unknown as ChallengeResourceRepository

  const platformClient = {
    fileDownloadLink: fileDownloadLinkStub,
  } as unknown as PlatformClient

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    await em.flush()

    userCtx = {
      id: user.id,
      accessToken: 'accessToken',
      dxuser: 'dxuser',
    }

    findChallengesStub.reset()
    findChallengesStub.resolves([
      {
        name: CHALLENGE_NAME,
        cardImage: {
          getEntity: () => ({
            dxid: FILE_DXID,
            name: FILE_NAME,
            project: PROJECT,
          }),
        },
      },
    ])
    findChallengeResourcesStub.reset()
    findChallengeResourcesStub.resolves([
      {
        name: FILE_NAME,
        userFile: {
          getEntity: () => ({
            dxid: FILE_DXID,
            name: FILE_NAME,
            project: PROJECT,
          }),
        },
      },
    ])

    fileDownloadLinkStub.reset()
    fileDownloadLinkStub.resolves({
      url: LINK_URL,
      expires: 123,
      headers: [],
    })

    notificationService = {
      async createNotification(params: NotificationInput): Promise<void> {
        notificationParams = params
      },
    } as NotificationService

    const logger = {
      log: () => {},
    } as unknown as Logger

    challengeService = new ChallengeService(
      em,
      userCtx,
      logger,
      platformClient,
      notificationService,
      challengeRepository,
      challengeResourceRepository,
    )
  })

  it('updateCardImageUrl - all correct', async () => {
    await challengeService.updateCardImageUrl(FILE_UID)

    expect(findChallengesStub.getCall(0).args[0]).to.eq(FILE_UID)
    expect(fileDownloadLinkStub.getCall(0).args[0]).to.deep.equal({
      fileDxid: FILE_DXID,
      filename: FILE_NAME,
      project: PROJECT,
      duration: 9999999999,
    })
    expect(notificationParams).to.deep.equal({
      message: `Card image url for ${CHALLENGE_NAME} has been updated`,
      action: 'CHALLENGE_CARD_IMAGE_URL_UPDATED',
      severity: 'INFO',
      userId: user.id,
    })
  })

  it('updateCardImageUrl - error no challenge', async () => {
    findChallengesStub.resolves([])
    await expect(challengeService.updateCardImageUrl(FILE_UID)).to.be.rejectedWith(
      NotFoundError,
      `Challenge for fileUid ${FILE_UID} was not found`,
    )
  })

  it('updateResourceUrl - all correct', async () => {
    await challengeService.updateResourceUrl(FILE_UID)

    expect(findChallengeResourcesStub.getCall(0).args[0]).to.eq(FILE_UID)
    expect(fileDownloadLinkStub.getCall(0).args[0]).to.deep.equal({
      fileDxid: FILE_DXID,
      filename: FILE_NAME,
      project: PROJECT,
      duration: 9999999999,
    })
    expect(notificationParams).to.deep.equal({
      message: `Resource url for ${FILE_NAME} has been updated`,
      action: 'CHALLENGE_RESOURCE_URL_UPDATED',
      severity: 'INFO',
      userId: user.id,
    })
  })

  it('updateResourceUrl - error no challenge resource', async () => {
    findChallengeResourcesStub.resolves([])
    await expect(challengeService.updateResourceUrl(FILE_UID)).to.be.rejectedWith(
      NotFoundError,
      `Challenge resource for fileUid ${FILE_UID} was not found`,
    )
  })
})
