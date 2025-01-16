import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { ChallengeResource } from '@shared/domain/challenge/challenge-resource.entity'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { ChallengeService } from '@shared/domain/challenge/challenge.service'
import { NotificationModule } from '@shared/domain/notification/notification.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { EmailModule } from '@shared/domain/email/email.module'

@Module({
  imports: [
    PlatformClientModule,
    NotificationModule,
    UserFileModule,
    MikroOrmModule.forFeature([ChallengeResource, Challenge]),
    EmailModule,
  ],
  providers: [ChallengeService],
  exports: [ChallengeService, MikroOrmModule],
})
export class ChallengeModule {}
