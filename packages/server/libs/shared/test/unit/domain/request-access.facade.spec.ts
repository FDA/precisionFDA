import { CaptchaService } from '@shared/captcha/captcha.service'
import { EmailService } from '@shared/domain/email/email.service'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { InvitationService } from '@shared/domain/invitation/services/invitation.service'
import { UserService } from '@shared/domain/user/service/user.service'
import { InvalidCaptchaError, InvalidRequestError } from '@shared/errors'
import { RequestAccessFacade } from '@shared/facade/request-access/request-access.facade'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('RequestAccessFacade', () => {
  const createInvitationStub = stub()
  const sendEmailStub = stub()
  const emailExistsOnDBStub = stub()
  const emailExistsOnPlatformStub = stub()
  const verifyCaptchaAssessmentStub = stub()

  const FIRST_NAME = 'Test'
  const LAST_NAME = 'User'
  const EMAIL = 'test@user.test'
  const DUNS = '123456789'
  const REASON = 'Testing'
  const PARTICIPATE_INTENT = false
  const ORGANIZE_INTENT = false
  const REQ_DATA = ''
  const REQ_SOFTWARE = ''
  const RESEARCH_INTENT = false
  const CLINICAL_INTENT = false
  const REQUEST_ACCESS_ID = 1

  const invitationService = {
    createInvitation: createInvitationStub,
  } as unknown as InvitationService
  const emailService = {
    sendEmail: sendEmailStub,
  } as unknown as EmailService
  const userService = {
    emailExistsOnDB: emailExistsOnDBStub,
    emailExistsOnPlatform: emailExistsOnPlatformStub,
  } as unknown as UserService
  const captchaService = {
    verifyCaptchaAssessment: verifyCaptchaAssessmentStub,
  } as unknown as CaptchaService

  beforeEach(() => {
    createInvitationStub.reset()
    sendEmailStub.reset()
    emailExistsOnDBStub.reset()
    emailExistsOnPlatformStub.reset()
    verifyCaptchaAssessmentStub.reset()

    emailExistsOnDBStub.resolves(false)
    emailExistsOnPlatformStub.resolves(false)
    verifyCaptchaAssessmentStub.resolves(true)
  })

  it('should throw an error if captcha is invalid', async () => {
    verifyCaptchaAssessmentStub.resolves(false)
    const instance = getInstance()
    const requestData = {
      firstName: FIRST_NAME,
      lastName: LAST_NAME,
      email: EMAIL,
      duns: DUNS,
      reason: REASON,
      participateIntent: PARTICIPATE_INTENT,
      organizeIntent: ORGANIZE_INTENT,
      reqData: REQ_DATA,
      reqSoftware: REQ_SOFTWARE,
      researchIntent: RESEARCH_INTENT,
      clinicalIntent: CLINICAL_INTENT,
      captchaValue: 'invalid-captcha',
    }
    await expect(instance.requestAccess(requestData)).to.be.rejectedWith(
      InvalidCaptchaError,
      'Invalid captcha value',
    )
    expect(verifyCaptchaAssessmentStub.calledOnce).to.be.true
    expect(verifyCaptchaAssessmentStub.firstCall.args[0]).to.equal('invalid-captcha')
    expect(verifyCaptchaAssessmentStub.firstCall.args[1]).to.equal('request_access')
  })

  it('should throw an error if email already exists in the database', async () => {
    emailExistsOnDBStub.resolves(true)
    const instance = getInstance()
    const requestData = {
      firstName: FIRST_NAME,
      lastName: LAST_NAME,
      email: EMAIL,
      duns: DUNS,
      reason: REASON,
      participateIntent: PARTICIPATE_INTENT,
      organizeIntent: ORGANIZE_INTENT,
      reqData: REQ_DATA,
      reqSoftware: REQ_SOFTWARE,
      researchIntent: RESEARCH_INTENT,
      clinicalIntent: CLINICAL_INTENT,
    }
    await expect(instance.requestAccess(requestData)).to.be.rejectedWith(
      InvalidRequestError,
      'This email address is already being used for a precisionFDA account. Please choose a different email address for precisionFDA.',
    )
  })

  it('should throw an error if email already exists on the platform', async () => {
    emailExistsOnPlatformStub.resolves(true)
    const instance = getInstance()
    const requestData = {
      firstName: FIRST_NAME,
      lastName: LAST_NAME,
      email: EMAIL,
      duns: DUNS,
      reason: REASON,
      participateIntent: PARTICIPATE_INTENT,
      organizeIntent: ORGANIZE_INTENT,
      reqData: REQ_DATA,
      reqSoftware: REQ_SOFTWARE,
      researchIntent: RESEARCH_INTENT,
      clinicalIntent: CLINICAL_INTENT,
    }
    await expect(instance.requestAccess(requestData)).to.be.rejectedWith(
      InvalidRequestError,
      'This email address is already being used for a DNAnexus account. Please choose a different email address for precisionFDA.',
    )
  })

  it('should create an invitation and send an email', async () => {
    createInvitationStub.resolves({ id: REQUEST_ACCESS_ID })
    const instance = getInstance()
    const requestData = {
      firstName: FIRST_NAME,
      lastName: LAST_NAME,
      email: EMAIL,
      duns: DUNS,
      reason: REASON,
      participateIntent: PARTICIPATE_INTENT,
      organizeIntent: ORGANIZE_INTENT,
      reqData: REQ_DATA,
      reqSoftware: REQ_SOFTWARE,
      researchIntent: RESEARCH_INTENT,
      clinicalIntent: CLINICAL_INTENT,
    }
    const result = await instance.requestAccess(requestData)

    expect(createInvitationStub.calledOnce).to.be.true
    expect(createInvitationStub.firstCall.args[0]).to.deep.equal(requestData)
    expect(emailExistsOnDBStub.calledOnce).to.be.true
    expect(emailExistsOnPlatformStub.calledOnce).to.be.true
    expect(sendEmailStub.calledOnce).to.be.true
    expect(sendEmailStub.firstCall.args[0]).to.deep.equal({
      type: EMAIL_TYPES.invitation,
      input: {
        id: REQUEST_ACCESS_ID,
      },
    })
    expect(result).to.have.property('id')
  })

  function getInstance(): RequestAccessFacade {
    return new RequestAccessFacade(invitationService, emailService, userService, captchaService)
  }
})
