import { Module } from '@nestjs/common'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { EntityProvenanceModule } from '@shared/domain/provenance/entity-provenance.module'
import { TrackApiFacade } from './track-api.facade'

@Module({
  imports: [EntityProvenanceModule, EntityModule],
  providers: [TrackApiFacade],
  exports: [TrackApiFacade],
})
export class TrackApiFacadeModule {}
