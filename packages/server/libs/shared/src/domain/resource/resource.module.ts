import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Resource } from '@shared/domain/resource/resource.entity'

@Module({
  imports: [MikroOrmModule.forFeature([Resource])],
  exports: [MikroOrmModule],
})
export class ResourceModule {}
