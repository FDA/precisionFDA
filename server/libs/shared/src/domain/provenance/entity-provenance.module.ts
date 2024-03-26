import { Module } from '@nestjs/common'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { EntityProvenanceDataProviderModule } from '@shared/domain/provenance/service/entity-data/entity-provenance-data-provider.module'
import { EntityProvenanceService } from '@shared/domain/provenance/service/entity-provenance.service'
import { EntityProvenanceSvgResultTransformerService } from '@shared/domain/provenance/service/result-transform/entity-provenance-svg-result-transformer.service'

@Module({
  imports: [EntityProvenanceDataProviderModule, EntityModule],
  providers: [EntityProvenanceService, EntityProvenanceSvgResultTransformerService],
  exports: [EntityProvenanceService],
})
export class EntityProvenanceModule {}
