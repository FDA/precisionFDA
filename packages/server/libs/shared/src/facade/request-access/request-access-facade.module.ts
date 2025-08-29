import { Module } from '@nestjs/common'
import { CaptchaModule } from '@shared/captcha/captcha.module'
import { EmailModule } from '@shared/domain/email/email.module'
import { InvitationModule } from '@shared/domain/invitation/invitation.module'
import { UserModule } from '@shared/domain/user/user.module'
import { RequestAccessFacade } from './request-access.facade'

@Module({
  imports: [EmailModule, InvitationModule, UserModule, CaptchaModule],
  providers: [RequestAccessFacade],
  exports: [RequestAccessFacade],
})
export class RequestAccessFacadeModule {}
