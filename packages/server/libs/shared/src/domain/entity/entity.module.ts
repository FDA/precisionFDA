import { Module } from '@nestjs/common'
import { EntityService } from '@shared/domain/entity/entity.service'
import { EntityIconModule } from '@shared/domain/entity/entity-icon/entity-icon.module'
import { EntityLinkModule } from '@shared/domain/entity/entity-link/entity-link.module'

@Module({
  imports: [EntityLinkModule, EntityIconModule],
  providers: [EntityService],
  exports: [EntityService],
})
export class EntityModule {}
