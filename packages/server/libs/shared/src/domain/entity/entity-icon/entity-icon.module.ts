import { Module } from '@nestjs/common'
import { EntityIconService } from '@shared/domain/entity/entity-icon/entity-icon.service'

@Module({
  providers: [EntityIconService],
  exports: [EntityIconService],
})
export class EntityIconModule {}
