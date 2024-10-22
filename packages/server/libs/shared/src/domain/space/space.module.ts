import { Module } from '@nestjs/common'
import { SpaceCreateModule } from '@shared/domain/space/create/space-create.module'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Space } from '@shared/domain/space/space.entity'

@Module({
  imports: [SpaceCreateModule, MikroOrmModule.forFeature([Space])],
  providers: [SpaceService],
  exports: [SpaceService, MikroOrmModule],
})
export class SpaceModule {}
