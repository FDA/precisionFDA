import * as MikroOrmCore from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import { CaptchaService } from '@shared/captcha/captcha.service'
import { App } from '@shared/domain/app/app.entity'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { CHALLENGE_STATUS } from '@shared/domain/challenge/challenge.enum'
import { ChallengeRepository } from '@shared/domain/challenge/challenge.repository'
import { ChallengeService } from '@shared/domain/challenge/challenge.service'
import { ChallengeResourceRepository } from '@shared/domain/challenge/challenge-resource.repository'
import { EmailService } from '@shared/domain/email/email.service'
import { Event } from '@shared/domain/event/event.entity'
import { EventHelper } from '@shared/domain/event/event.helper'
import { ChallengeFollow } from '@shared/domain/follow/challenge-follow.entity'
import { NotificationInput } from '@shared/domain/notification/notification.input'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { NotFoundError, ValidationError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'

describe('ChallengeService', () => {
  let user: User
  let userCtx: UserContext

  let challengeService: ChallengeService
  let notificationService: NotificationService
  let notificationParams: NotificationInput

  const USER_ID = 100
  const SESSION_ID = 'sessionId'
  const LINK_URL = 'https://example.com'
  const CHALLENGE_NAME = 'challenge-name'
  const FILE_DXID = 'file-xxxx'
  const FILE_UID = `${FILE_DXID}-1`
  const FILE_NAME = 'fileName'
  const PROJECT = 'project'

  const flushStub = stub().resolves()
  const persistStub = stub().returnsThis()
  const findOneStub = stub()
  const transactionalStub = stub()

  const em = {
    flush: flushStub,
    persist: persistStub,
    findOne: findOneStub,
    transactional: transactionalStub,
  } as unknown as SqlEntityManager

  const findChallengesStub = stub()
  const findChallengeResourcesStub = stub()
  const findAccessibleOneStub = stub()

  const challengeRepository = {
    findChallengesByCardImageFileUid: findChallengesStub,
    findAccessibleOne: findAccessibleOneStub,
  } as unknown as ChallengeRepository

  const challengeResourceRepository = {
    findChallengeResourcesByFileUid: findChallengeResourcesStub,
  } as unknown as ChallengeResourceRepository

  const fileDownloadLinkStub = stub()
  const platformClient = {
    fileDownloadLink: fileDownloadLinkStub,
  } as unknown as PlatformClient
  const challengePlatformClient = {
    fileDownloadLink: fileDownloadLinkStub,
  } as unknown as PlatformClient

  const verifyCaptchaAssessmentStub = stub().resolves(true)
  const captchaService = {
    verifyCaptchaAssessment: verifyCaptchaAssessmentStub,
  } as unknown as CaptchaService

  const createSignedUpForChallengeEventStub = stub()
  const eventHelper = {
    createSignedUpForChallengeEvent: createSignedUpForChallengeEventStub,
  } as unknown as EventHelper

  beforeEach(() => {
    user = {
      id: USER_ID,
      dxuser: 'dxuser',
    } as unknown as User

    userCtx = {
      id: user.id,
      accessToken: 'accessToken',
      dxuser: user.dxuser,
      sessionId: SESSION_ID,
      loadEntity: async (): Promise<User> => Promise.resolve(user),
    }

    flushStub.resetHistory()
    persistStub.resetHistory()
    findOneStub.reset()
    transactionalStub.reset()
    transactionalStub.callsFake(async <T>(cb: (em: SqlEntityManager) => Promise<T>) => cb(em))

    findChallengesStub.reset()
    findChallengesStub.resolves([
      {
        name: CHALLENGE_NAME,
        cardImage: {
          getEntity: (): UserFile =>
            ({
              dxid: FILE_DXID,
              name: FILE_NAME,
              project: PROJECT,
            }) as unknown as UserFile,
        },
      },
    ])

    findChallengeResourcesStub.reset()
    findChallengeResourcesStub.resolves([
      {
        name: FILE_NAME,
        userFile: {
          getEntity: (): UserFile =>
            ({
              dxid: FILE_DXID,
              name: FILE_NAME,
              project: PROJECT,
            }) as unknown as UserFile,
        },
      },
    ])

    findAccessibleOneStub.reset()

    fileDownloadLinkStub.reset()
    fileDownloadLinkStub.resolves({
      url: LINK_URL,
      expires: 123,
      headers: [],
    })

    createSignedUpForChallengeEventStub.reset()

    notificationParams = undefined
    notificationService = {
      async createNotification(params: NotificationInput): Promise<void> {
        notificationParams = params
      },
    } as NotificationService

    challengeService = new ChallengeService(
      em,
      userCtx,
      challengePlatformClient,
      platformClient,
      notificationService,
      challengeRepository,
      challengeResourceRepository,
      captchaService,
      eventHelper,
      { sendEmail: stub() } as unknown as EmailService,
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
    expect(flushStub.called).to.be.true()
    expect(notificationParams).to.deep.equal({
      message: `Card image url for ${CHALLENGE_NAME} has been updated`,
      action: 'CHALLENGE_CARD_IMAGE_URL_UPDATED',
      severity: 'INFO',
      userId: user.id,
      sessionId: SESSION_ID,
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
    expect(flushStub.called).to.be.true()
    expect(notificationParams).to.deep.equal({
      message: `Resource url for ${FILE_NAME} has been updated`,
      action: 'CHALLENGE_RESOURCE_URL_UPDATED',
      severity: 'INFO',
      userId: user.id,
      sessionId: SESSION_ID,
    })
  })

  it('updateResourceUrl - error no challenge resource', async () => {
    findChallengeResourcesStub.resolves([])
    await expect(challengeService.updateResourceUrl(FILE_UID)).to.be.rejectedWith(
      NotFoundError,
      `Challenge resource for fileUid ${FILE_UID} was not found`,
    )
  })

  describe('joinChallenge', () => {
    const CHALLENGE_ID = 42
    let existsStub: SinonStub
    let addStub: SinonStub
    let challenge: Challenge
    let referenceCreateStub: SinonStub

    before(() => {
      // Reference.create / the entity setter on ChallengeFollow.followableId both walk
      // Mikro-ORM's helper symbols, which our plain stub challenge doesn't carry.
      // Short-circuit them so the test focuses on ChallengeService behavior.
      referenceCreateStub = stub(MikroOrmCore.Reference, 'create').callsFake((entity: unknown) => entity as never)
    })

    after(() => {
      referenceCreateStub.restore()
    })

    beforeEach(() => {
      existsStub = stub()
      addStub = stub()
      challenge = {
        id: CHALLENGE_ID,
        follows: {
          exists: existsStub,
          add: addStub,
        },
      } as unknown as Challenge
    })

    it('creates a ChallengeFollow and SIGNED_UP_FOR_CHALLENGE event for first-time join', async () => {
      const event = { id: 'event' } as unknown as Event
      findAccessibleOneStub.resolves(challenge)
      existsStub.returns(false)
      createSignedUpForChallengeEventStub.resolves(event)

      await challengeService.joinChallenge(CHALLENGE_ID)

      expect(findAccessibleOneStub.getCall(0).args[0]).to.deep.equal({ id: CHALLENGE_ID })
      expect(findAccessibleOneStub.getCall(0).args[1]).to.deep.equal({ populate: ['follows'] })

      expect(addStub.calledOnce).to.be.true()
      const addedFollow = addStub.getCall(0).args[0] as ChallengeFollow
      expect(addedFollow).to.be.instanceOf(ChallengeFollow)
      expect(addedFollow.followableType).to.eq('Challenge')
      expect(addedFollow.followerId).to.eq(user.id)
      expect(addedFollow.followerType).to.eq('User')
      expect(addedFollow.blocked).to.be.false()

      expect(createSignedUpForChallengeEventStub.calledOnceWith(user, challenge)).to.be.true()
      expect(persistStub.calledOnceWith([challenge, event])).to.be.true()
    })

    it('is idempotent when the user already follows the challenge', async () => {
      findAccessibleOneStub.resolves(challenge)
      existsStub.returns(true)

      await challengeService.joinChallenge(CHALLENGE_ID)

      expect(addStub.called).to.be.false()
      expect(createSignedUpForChallengeEventStub.called).to.be.false()
      expect(persistStub.called).to.be.false()
    })

    it('throws NotFoundError when the challenge does not exist', async () => {
      findAccessibleOneStub.resolves(null)

      await expect(challengeService.joinChallenge(999999)).to.be.rejectedWith(NotFoundError)
      expect(addStub.called).to.be.false()
      expect(persistStub.called).to.be.false()
    })
  })

  describe('getChallengeApp', () => {
    const CHALLENGE_ID = 1
    const APP_ID = 7
    const INPUT_SPEC = [{ name: 'input', class: 'string' }]

    it('throws NotFoundError when challenge is not found', async () => {
      findAccessibleOneStub.resolves(null)
      await expect(challengeService.getChallengeApp(CHALLENGE_ID)).to.be.rejectedWith(
        NotFoundError,
        'Challenge not found!',
      )
    })

    it('throws ValidationError when challenge is not open', async () => {
      findAccessibleOneStub.resolves({
        id: CHALLENGE_ID,
        status: CHALLENGE_STATUS.PRE_REGISTRATION,
        app: { id: APP_ID },
      })
      await expect(challengeService.getChallengeApp(CHALLENGE_ID)).to.be.rejectedWith(
        ValidationError,
        'Challenge is not open!',
      )
    })

    it('throws NotFoundError when no app is assigned to the challenge', async () => {
      findAccessibleOneStub.resolves({
        id: CHALLENGE_ID,
        status: CHALLENGE_STATUS.OPEN,
        app: null,
      })
      await expect(challengeService.getChallengeApp(CHALLENGE_ID)).to.be.rejectedWith(
        NotFoundError,
        'No app assigned to this challenge!',
      )
    })

    it('throws NotFoundError when the challenge app does not exist in the database', async () => {
      findAccessibleOneStub.resolves({
        id: CHALLENGE_ID,
        status: CHALLENGE_STATUS.OPEN,
        app: { id: APP_ID, load: stub().resolves(null) },
      })

      await expect(challengeService.getChallengeApp(CHALLENGE_ID)).to.be.rejectedWith(
        NotFoundError,
        'Challenge app not found!',
      )
    })

    it('throws NotFoundError when the challenge app has been deleted', async () => {
      findAccessibleOneStub.resolves({
        id: CHALLENGE_ID,
        status: CHALLENGE_STATUS.OPEN,
        app: {
          id: APP_ID,
          load: stub().resolves({ id: APP_ID, deleted: true, spec: { input_spec: INPUT_SPEC } } as unknown as App),
        },
      })

      await expect(challengeService.getChallengeApp(CHALLENGE_ID)).to.be.rejectedWith(
        NotFoundError,
        'Challenge app not found!',
      )
    })

    it('returns ChallengeAppDTO with the app input spec on success', async () => {
      findAccessibleOneStub.resolves({
        id: CHALLENGE_ID,
        status: CHALLENGE_STATUS.OPEN,
        app: {
          id: APP_ID,
          load: stub().resolves({ id: APP_ID, deleted: false, spec: { input_spec: INPUT_SPEC } } as unknown as App),
        },
      })

      const result = await challengeService.getChallengeApp(CHALLENGE_ID)
      expect(result.inputSpec).to.deep.equal(INPUT_SPEC)
    })

    it('returns input spec for a private app owned by a different user (challenge bot scenario)', async () => {
      // ChallengeService.getChallengeApp does not gate on app ownership/scope, so a private
      // app belonging to a different user (e.g. the challenge bot) is returned just like any other.
      findAccessibleOneStub.resolves({
        id: CHALLENGE_ID,
        status: CHALLENGE_STATUS.OPEN,
        app: {
          id: APP_ID,
          load: stub().resolves({
            id: APP_ID,
            deleted: false,
            scope: 'private',
            user: { id: user.id + 1 },
            spec: { input_spec: INPUT_SPEC },
          } as unknown as App),
        },
      })

      const result = await challengeService.getChallengeApp(CHALLENGE_ID)
      expect(result.inputSpec).to.deep.equal(INPUT_SPEC)
    })
  })
})
