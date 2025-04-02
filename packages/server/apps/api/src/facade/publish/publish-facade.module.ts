import { Module } from '@nestjs/common'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { EntityProvenanceModule } from '@shared/domain/provenance/entity-provenance.module'
import { UserFileModule } from '@shared/domain/user-file/user-file.module'
import { PublishApiFacade } from './publish.facade'

@Module({
  imports: [EntityProvenanceModule, EntityModule, UserFileModule],
  providers: [PublishApiFacade],
  exports: [PublishApiFacade],
})
export class PublishApiFacadeModule {}
