import { Injectable } from '@nestjs/common'
import { CaptchaService } from '@shared/captcha/captcha.service'
import { EmailService } from '@shared/domain/email/email.service'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { RequestAccessDTO } from '@shared/domain/invitation/dto/request-access.dto'
import { InvitationService } from '@shared/domain/invitation/services/invitation.service'
import { UserService } from '@shared/domain/user/user.service'
import { ErrorCodes, InvalidCaptchaError, InvalidRequestError } from '@shared/errors'

@Injectable()
export class RequestAccessFacade {
  constructor(
    private readonly invitationService: InvitationService,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
    private readonly captchaService: CaptchaService,
  ) {}

  async requestAccess(dto: RequestAccessDTO): Promise<{ id: number }> {
    if (!(await this.captchaService.verifyCaptchaAssessment(dto.captchaValue, 'request_access'))) {
      throw new InvalidCaptchaError('Invalid captcha value')
    }

    if (await this.userService.emailExistsOnDB(dto.email)) {
      throw new InvalidRequestError(this.emailExistsMessage('precisionFDA'), {
        code: ErrorCodes.EMAIL_EXISTS,
      })
    }

    if (await this.userService.emailExistsOnPlatform(dto.email)) {
      throw new InvalidRequestError(this.emailExistsMessage('DNAnexus'), {
        code: ErrorCodes.EMAIL_EXISTS,
      })
    }

    const invitation = await this.invitationService.createInvitation(dto)
    await this.emailService.sendEmail({
      type: EMAIL_TYPES.invitation,
      input: {
        id: invitation.id,
      },
    })
    return { id: invitation.id }
  }

  private emailExistsMessage(side: string): string {
    return `This email address is already being used for a ${side} account. Please choose a different email address for precisionFDA.`
  }
}
