import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Tag } from '@shared/domain/tag/tag.entity'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { TaggingService } from '@shared/domain/tagging/tagging.service'

@Module({
  imports: [MikroOrmModule.forFeature([Tagging, Tag])],
  providers: [TaggingService],
  exports: [TaggingService],
})
export class TaggingModule {}
