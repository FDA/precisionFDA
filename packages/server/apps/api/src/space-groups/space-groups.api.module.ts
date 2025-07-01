import { Module } from '@nestjs/common'
import { SpaceGroupsController } from './space-groups.controller'
import { SpaceModule } from '@shared/domain/space/space.module'

@Module({
  imports: [SpaceModule],
  controllers: [SpaceGroupsController],
})
export class SpaceGroupsApiModule {}
