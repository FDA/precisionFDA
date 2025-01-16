import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { EmailModule } from '@shared/domain/email/email.module'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Space } from '@shared/domain/space/space.entity'
import { User } from '@shared/domain/user/user.entity'
import { SpaceEvent } from './space-event.entity'

@Module({
  imports: [EmailModule, MikroOrmModule.forFeature([Space, User, SpaceMembership, SpaceEvent])],
  providers: [SpaceEventService],
  exports: [SpaceEventService, MikroOrmModule],
})
export class SpaceEventModule {}
