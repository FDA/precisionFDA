import { Module } from '@nestjs/common'
import { TaggingService } from '@shared/domain/tagging/tagging.service'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Tagging } from '@shared/domain/tagging/tagging.entity'

@Module({
  imports: [MikroOrmModule.forFeature([Tagging])],
  providers: [TaggingService],
  exports: [TaggingService],
})
export class TaggingModule {}
