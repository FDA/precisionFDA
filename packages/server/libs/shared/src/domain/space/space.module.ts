import { Module } from '@nestjs/common'
import { SpaceCreateModule } from '@shared/domain/space/create/space-create.module'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Space } from '@shared/domain/space/space.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { User } from '@shared/domain/user/user.entity'
import { SpaceGroup } from '@shared/domain/space/space-group.entity'
import { SpaceGroupService } from '@shared/domain/space/service/space-group.service'
import { EventModule } from '@shared/domain/event/event.module'

@Module({
  imports: [
    SpaceCreateModule,
    EventModule,
    MikroOrmModule.forFeature([Space, SpaceMembership, User, SpaceGroup]),
  ],
  providers: [SpaceService, SpaceGroupService],
  exports: [SpaceService, MikroOrmModule],
})
export class SpaceModule {}
