import { Module } from '@nestjs/common'
import { EntityFetcherService } from '@shared/domain/entity/entity-fetcher.service'

@Module({
  providers: [EntityFetcherService],
  exports: [EntityFetcherService],
})
export class EntityModule {}
