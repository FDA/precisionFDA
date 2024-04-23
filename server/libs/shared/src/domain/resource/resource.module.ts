import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Resource } from '@shared/domain/resource/resource.entity'
import { ResourceService } from '@shared/domain/resource/service/resource.service'

@Module({
  imports: [MikroOrmModule.forFeature([Resource])],
  providers: [
    ResourceService,
  ],
  exports: [
    MikroOrmModule,
    ResourceService,
  ],
})
export class ResourceModule {}
