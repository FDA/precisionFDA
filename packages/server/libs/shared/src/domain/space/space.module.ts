import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { EventModule } from '@shared/domain/event/event.module'
import { SpaceCreateModule } from '@shared/domain/space/create/space-create.module'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SpaceGroupService } from '@shared/domain/space/service/space-group.service'
import { Space } from '@shared/domain/space/space.entity'
import { SpaceGroup } from '@shared/domain/space/space-group.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { User } from '@shared/domain/user/user.entity'

@Module({
  imports: [SpaceCreateModule, EventModule, MikroOrmModule.forFeature([Space, SpaceMembership, User, SpaceGroup])],
  providers: [SpaceService, SpaceGroupService],
  exports: [SpaceService, MikroOrmModule],
})
export class SpaceModule {}
