import { Module } from '@nestjs/common'
import { EntityProvenanceModule } from '@shared/domain/provenance/entity-provenance.module'
import { TrackApiFacade } from './track-api.facade'

@Module({
  imports: [EntityProvenanceModule],
  providers: [TrackApiFacade],
  exports: [TrackApiFacade],
})
export class TrackApiFacadeModule {}