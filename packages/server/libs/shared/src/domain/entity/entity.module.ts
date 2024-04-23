import { Module } from '@nestjs/common'
import { EntityFetcherService } from '@shared/domain/entity/entity-fetcher.service'
import { EntityIconModule } from '@shared/domain/entity/entity-icon/entity-icon.module'
import { EntityLinkModule } from '@shared/domain/entity/entity-link/entity-link.module'
import { EntityService } from '@shared/domain/entity/entity.service'

@Module({
  imports: [EntityLinkModule, EntityIconModule],
  providers: [EntityFetcherService, EntityService],
  exports: [EntityFetcherService, EntityService],
})
export class EntityModule {}
