import { Module } from '@nestjs/common'
import { TaggingService } from '@shared/domain/tagging/tagging.service'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { Tag } from '@shared/domain/tag/tag.entity'

@Module({
  imports: [MikroOrmModule.forFeature([Tagging, Tag])],
  providers: [TaggingService],
  exports: [TaggingService],
})
export class TaggingModule {}
