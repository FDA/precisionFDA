import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Resource } from '@shared/domain/resource/resource.entity'
import { ResourceService } from './service/resource.service'

@Module({
  imports: [MikroOrmModule.forFeature([Resource])],
  providers: [ResourceService],
  exports: [ResourceService],
})
export class ResourceModule {}
