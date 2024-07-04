import { Module } from '@nestjs/common'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { User } from '@shared/domain/user/user.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { EmailModule } from '@shared/domain/email/email.module'

@Module({
  imports: [EmailModule, MikroOrmModule.forFeature([Space, User, SpaceMembership])],
  providers: [SpaceEventService],
  exports: [SpaceEventService],
})
export class SpaceEventModule {}
