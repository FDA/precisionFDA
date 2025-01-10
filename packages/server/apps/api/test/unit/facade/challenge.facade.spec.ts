import { SinonStub, stub } from 'sinon'
import { expect } from 'chai'
import { CreateChallengeDTO } from '@shared/domain/challenge/dto/create-challenge.dto'
import { CHALLENGE_STATUS } from '@shared/domain/challenge/challenge.enum'
import { ChallengeFacade } from '../../../src/facade/challenge/challenge.facade'
import { ChallengeService } from '@shared/domain/challenge/challenge.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { EmailFacade } from '@shared/domain/email/email.facade'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { UpdateChallengeDTO } from '@shared/domain/challenge/dto/update-challenge.dto'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { STATIC_SCOPE } from '@shared/enums'
import { PlatformClient } from '@shared/platform-client'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'

describe('ChallengeFacade', () => {
  const CREATE_CHALLENGE_DTO = {
    name: 'name',
    description: 'description',
    startAt: new Date(),
    endAt: new Date(),
    status: CHALLENGE_STATUS.PRE_REGISTRATION,
    preRegistrationUrl: 'https://dnanexus.com/',
    scope: 'public',
    appOwnerId: 1,
    guestLeadDxuser: 'guest',
    hostLeadDxuser: 'host',
  } as CreateChallengeDTO

  const PREREG_CHALLENGE = {
    id: 1,
    name: CREATE_CHALLENGE_DTO.name,
    description: CREATE_CHALLENGE_DTO.description,
    status: CREATE_CHALLENGE_DTO.status,
    scope: CREATE_CHALLENGE_DTO.scope,
    startAt: CREATE_CHALLENGE_DTO.startAt,
    endAt: CREATE_CHALLENGE_DTO.endAt,
    preRegistrationUrl: CREATE_CHALLENGE_DTO.preRegistrationUrl,
  } as Challenge

  const UPDATE_CHALLENGE_DTO = {
    name: 'name-edit',
    description: 'description-edit',
    startAt: new Date(),
    endAt: new Date(),
    status: CHALLENGE_STATUS.OPEN,
    scope: 'public',
    appOwnerId: 1,
    guestLeadDxuser: 'guest',
    hostLeadDxuser: 'host',
  } as UpdateChallengeDTO

  const FILE_DXID = 'file-dxid'

  let createChallengeStub: SinonStub
  let updateChallengeStub: SinonStub
  let getChallengeStub: SinonStub
  let createSpaceStub: SinonStub
  let sendEmailStub: SinonStub
  let fileCreateStub: SinonStub

  beforeEach(() => {
    createSpaceStub = stub()
    createChallengeStub = stub().returns(PREREG_CHALLENGE)
    updateChallengeStub = stub().returns(PREREG_CHALLENGE)
    getChallengeStub = stub().returns(PREREG_CHALLENGE)
    sendEmailStub = stub()
    fileCreateStub = stub().returns(FILE_DXID)
  })

  describe('createChallenge', () => {
    it('should call create challenge and space and send an email with correct args', async () => {
      await getInstance().createChallenge(CREATE_CHALLENGE_DTO)
      expect(createChallengeStub.calledOnce).to.be.true()
      // also check that args matches the expected
      expect(createChallengeStub.firstCall.args[0]).to.deep.eq(CREATE_CHALLENGE_DTO)
      expect(createSpaceStub.calledOnce).to.be.true()
      // also check that args matches the expected
      expect(createSpaceStub.firstCall.args[0]).to.deep.eq({
        name: CREATE_CHALLENGE_DTO.name,
        description: CREATE_CHALLENGE_DTO.description,
        forChallenge: true,
        guestLeadDxuser: CREATE_CHALLENGE_DTO.guestLeadDxuser,
        hostLeadDxuser: CREATE_CHALLENGE_DTO.hostLeadDxuser,
        spaceType: SPACE_TYPE.GROUPS,
        restrictedReviewer: false,
        protected: false,
      })
      expect(sendEmailStub.calledOnce).to.be.true()
      expect(sendEmailStub.firstCall.args[0]).to.deep.eq({
        emailTypeId: EMAIL_TYPES.challengePrereg,
        input: {
          challengeId: 1,
          name: 'name',
          scope: STATIC_SCOPE.PUBLIC,
        },
        receiverUserIds: [],
      })
    })

    it('should call create challenge and space and do not send an email', async () => {
      const CREATE_SETUP_CHALLENGE_DTO = {
        ...CREATE_CHALLENGE_DTO,
        status: CHALLENGE_STATUS.SETUP,
      } as CreateChallengeDTO

      const SETUP_CHALLENGE = {
        id: 2,
        name: CREATE_SETUP_CHALLENGE_DTO.name,
        description: CREATE_SETUP_CHALLENGE_DTO.description,
        status: CREATE_SETUP_CHALLENGE_DTO.status,
        scope: CREATE_SETUP_CHALLENGE_DTO.scope,
        startAt: CREATE_SETUP_CHALLENGE_DTO.startAt,
        endAt: CREATE_SETUP_CHALLENGE_DTO.endAt,
        preRegistrationUrl: '',
      } as Challenge

      createChallengeStub = stub().returns(SETUP_CHALLENGE)
      await getInstance().createChallenge(CREATE_SETUP_CHALLENGE_DTO)

      expect(createChallengeStub.calledOnce).to.be.true()
      expect(createSpaceStub.calledOnce).to.be.true()
      expect(sendEmailStub.notCalled).to.be.true()
    })

    it('should call create challenge with already provided space and send an email', async () => {
      CREATE_CHALLENGE_DTO.scope = 'space-44'

      await getInstance().createChallenge(CREATE_CHALLENGE_DTO)
      expect(createChallengeStub.calledOnce).to.be.true()
      expect(createSpaceStub.notCalled).to.be.true()
      expect(sendEmailStub.calledOnce).to.be.true()
    })
  })

  it('should call update challenge and send open email', async () => {
    CREATE_CHALLENGE_DTO.status = CHALLENGE_STATUS.OPEN
    await getInstance().updateChallenge(1, UPDATE_CHALLENGE_DTO)

    expect(sendEmailStub.calledOnce).to.be.true()
    expect(getChallengeStub.calledOnce).to.be.true()
    expect(updateChallengeStub.calledOnce).to.be.true()
  })

  it('should call update challenge and not send any email', async () => {
    CREATE_CHALLENGE_DTO.status = CHALLENGE_STATUS.SETUP
    const NO_EMAIL_UPDATE_DTO = {
      ...UPDATE_CHALLENGE_DTO,
      status: CHALLENGE_STATUS.SETUP,
    } as UpdateChallengeDTO

    await getInstance().updateChallenge(1, NO_EMAIL_UPDATE_DTO)

    expect(sendEmailStub.notCalled).to.be.true()
    expect(getChallengeStub.calledOnce).to.be.true()
    expect(updateChallengeStub.calledOnce).to.be.true()
  })

  function getInstance() {
    const challengeService = {
      createChallenge: createChallengeStub,
      updateChallenge: updateChallengeStub,
      getChallenge: getChallengeStub,
    } as unknown as ChallengeService

    const spaceService = {
      create: createSpaceStub,
    } as unknown as SpaceService

    const emailFacade = {
      sendEmail: sendEmailStub,
    } as unknown as EmailFacade

    const challengeBotClient = {
      fileCreate: fileCreateStub,
    } as unknown as PlatformClient

    const userFileService = {
      sendEmail: sendEmailStub,
    } as unknown as UserFileService

    return new ChallengeFacade(
      challengeService,
      challengeBotClient,
      userFileService,
      spaceService,
      emailFacade,
    )
  }
})
