import { Injectable } from '@nestjs/common'
import { EntityService } from '@shared/domain/entity/entity.service'
import { EntityWithProvenanceType } from '@shared/domain/provenance/model/entity-with-provenance.type'
import { EntityUtils } from '@shared/utils/entity.utils'
import { EntityProvenanceData } from '../../model/entity-provenance-data'
import { EntityProvenanceSource } from '../../model/entity-provenance-source'
import { EntityProvenanceSourceUnion } from '../../model/entity-provenance-source-union'

@Injectable()
export abstract class EntityProvenanceDataService<T extends EntityWithProvenanceType> {
  constructor(private readonly entityService: EntityService) {}

  protected abstract type: T

  protected abstract getIdentifier(source: EntityProvenanceSource<T>['entity']): string

  protected getTitle(source: EntityProvenanceSource<T>['entity']): string {
    return EntityUtils.getEntityName(source)
  }

  abstract getParents(
    source: EntityProvenanceSource<T>['entity'],
  ): Promise<EntityProvenanceSourceUnion[]>

  abstract getChildren(
    source: EntityProvenanceSource<T>['entity'],
  ): Promise<EntityProvenanceSourceUnion[]>

  async getData(source: EntityProvenanceSource<T>['entity']): Promise<EntityProvenanceData<T>> {
    return {
      type: this.type,
      title: this.getTitle(source),
      url: await this.entityService.getEntityUiLink(source),
      identifier: this.getIdentifier(source),
    }
  }
}
