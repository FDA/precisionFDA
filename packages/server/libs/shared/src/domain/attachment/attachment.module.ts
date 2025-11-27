import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Attachment } from '@shared/domain/attachment/attachment.entity'

@Module({
  imports: [MikroOrmModule.forFeature([Attachment])],
  providers: [],
  exports: [MikroOrmModule],
})
export class AttachmentModule {}
