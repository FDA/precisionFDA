import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { CaptchaModule } from '@shared/captcha/captcha.module'
import { ChallengeResource } from '@shared/domain/challenge/challenge-resource.entity'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { ChallengeService } from '@shared/domain/challenge/challenge.service'
import { EmailModule } from '@shared/domain/email/email.module'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'

@Module({
  imports: [
    PlatformClientModule,
    NotificationModule,
    UserFileModule,
    MikroOrmModule.forFeature([ChallengeResource, Challenge]),
    EmailModule,
    CaptchaModule,
  ],
  providers: [ChallengeService],
  exports: [ChallengeService, MikroOrmModule],
})
export class ChallengeModule {}
